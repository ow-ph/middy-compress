const compress = (config: compressConfig) => {
  return ({
    after:(handler: any, next: any)=>{
      next();
    }
  })
}

export {compress};

export type compressConfig = {
  ignoreAcceptEncodingHeader?: boolean
}