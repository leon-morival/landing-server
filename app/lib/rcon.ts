import net from "node:net";

type RconPacket = {
  id: number;
  type: number;
  body: string;
};

const RCON_AUTH = 3;
const RCON_COMMAND = 2;

function getRconConfig() {
  const host = process.env.MINECRAFT_RCON_HOST;
  const password = process.env.MINECRAFT_RCON_PASSWORD;
  const port = Number(process.env.MINECRAFT_RCON_PORT ?? "25575");
  const timeoutMs = Number(process.env.MINECRAFT_RCON_TIMEOUT_MS ?? "5000");

  if (!host || !password) {
    throw new Error("RCON n'est pas configuré.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Le port RCON est invalide.");
  }

  return { host, password, port, timeoutMs };
}

function encodePacket(id: number, type: number, body: string) {
  const bodyBuffer = Buffer.from(body, "utf8");
  const packet = Buffer.alloc(4 + 4 + bodyBuffer.length + 2);

  packet.writeInt32LE(id, 0);
  packet.writeInt32LE(type, 4);
  bodyBuffer.copy(packet, 8);
  packet.writeInt8(0, 8 + bodyBuffer.length);
  packet.writeInt8(0, 8 + bodyBuffer.length + 1);

  const length = Buffer.alloc(4);
  length.writeInt32LE(packet.length, 0);

  return Buffer.concat([length, packet]);
}

function decodePackets(buffer: Buffer<ArrayBufferLike>) {
  const packets: RconPacket[] = [];
  let offset = 0;

  while (offset + 4 <= buffer.length) {
    const length = buffer.readInt32LE(offset);
    const packetStart = offset + 4;
    const packetEnd = packetStart + length;

    if (packetEnd > buffer.length) {
      break;
    }

    const id = buffer.readInt32LE(packetStart);
    const type = buffer.readInt32LE(packetStart + 4);
    const body = buffer.subarray(packetStart + 8, packetEnd - 2).toString("utf8");

    packets.push({ id, type, body });
    offset = packetEnd;
  }

  return {
    packets,
    rest: buffer.subarray(offset),
  };
}

function waitForPacket(
  socket: net.Socket,
  timeoutMs: number,
  isExpected: (packet: RconPacket) => boolean,
) {
  return new Promise<RconPacket>((resolve, reject) => {
    let buffer: Buffer<ArrayBufferLike> = Buffer.alloc(0);

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      clearTimeout(timer);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk: Buffer<ArrayBufferLike>) => {
      buffer = Buffer.concat([buffer, chunk]);
      const decoded = decodePackets(buffer);
      buffer = decoded.rest;

      const packet = decoded.packets.find(isExpected);
      if (packet) {
        cleanup();
        resolve(packet);
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout RCON."));
    }, timeoutMs);

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

function connectRcon(host: string, port: number, timeoutMs: number) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("Connexion RCON expirée."));
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });

    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export async function sendRconCommand(command: string) {
  const { host, password, port, timeoutMs } = getRconConfig();
  const socket = await connectRcon(host, port, timeoutMs);

  try {
    const authId = 1;
    const commandId = 2;

    socket.write(encodePacket(authId, RCON_AUTH, password));
    const authPacket = await waitForPacket(
      socket,
      timeoutMs,
      (packet) => packet.id === authId || packet.id === -1,
    );

    if (authPacket.id === -1) {
      throw new Error("Authentification RCON refusée.");
    }

    socket.write(encodePacket(commandId, RCON_COMMAND, command));
    const responsePacket = await waitForPacket(
      socket,
      timeoutMs,
      (packet) => packet.id === commandId,
    );

    return responsePacket.body.trim();
  } finally {
    socket.end();
    socket.destroy();
  }
}
