const compress = (config: ICompressConfig) => {
  return {
    after: (handler: any, next: any) => {
      next();
    },
  };
};

export { compress };

export interface ICompressConfig {
  ignoreAcceptEncodingHeader?: boolean;
}
