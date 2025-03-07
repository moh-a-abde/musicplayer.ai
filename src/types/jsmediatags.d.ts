declare module 'jsmediatags' {
  interface Tags {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    comment?: string;
    track?: string;
    genre?: string;
    picture?: {
      format: string;
      data: number[];
    };
    [key: string]: any;
  }

  interface Tag {
    tags: Tags;
  }

  interface Options {
    onSuccess: (tag: Tag) => void;
    onError: (error: Error) => void;
  }

  function read(file: File | string, options: Options): void;

  export default {
    read
  };
} 