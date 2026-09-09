declare module "mp4box" {
  export function createFile(): any;
  export class DataStream {
    static BIG_ENDIAN: boolean;
    static LITTLE_ENDIAN: boolean;
    constructor(buffer?: any, byteOffset?: number, endianness?: boolean);
    buffer: ArrayBuffer;
    write(stream: any): void;
  }
  const MP4Box: {
    createFile: () => any;
    DataStream: typeof DataStream;
    [key: string]: any;
  };
  export default MP4Box;
}
