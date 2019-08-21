import middy from 'middy';
import {gzip} from 'node-gzip';
import { ZlibOptions } from 'zlib';

const compress: middy.Middleware<ICompressConfig> = (config: ICompressConfig | undefined) => {
  const defaultLogger = (data:any) => { return };
  const logger = (config && config.logger) || defaultLogger;

  const zlibConfig = config && config.zlibConfig || {};
  return {
    after: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (!handler.response.body){
        logger('middy-compress::after - no body to gzip');
        next();
        return;
      }
      gzip(handler.response.body, zlibConfig)
        .then(response=>{
          handler.response = handler.response || {}
          handler.response.headers = handler.response.headers || {}

          handler.response.body = response.toString('base64');
          handler.response.isBase64Encoded = true;
          handler.response.headers["Content-Encoding"] = "gzip";

          logger('middy-compress::after - content g zipped');

          next();
        })
        .catch(err=> {
          logger('middy-compress::after - error');
          logger(err);
          next()
        });
    },
    
    
    onError: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {

      if (!handler.response.body){
        logger('middy-compress::onerror - no body to gzip');
        next(handler.error);
        return;
      }
      gzip(handler.response.body, zlibConfig)
        .then(response=>{

          handler.response = handler.response || {}
          handler.response.headers = handler.response.headers || {}

          handler.response.body = response.toString('base64');
          handler.response.isBase64Encoded = true;
          handler.response.headers["Content-Encoding"] = "gzip";

          logger('middy-compress::onerror - content g zipped');

          next(handler.error);
        })
        .catch(err=> {
          logger('middy-compress::onerror - error');
          logger(err);
          next(handler.error)
        });
    },

  };
};

const base64Decode: middy.Middleware<ICompressConfig> = (config: ICompressConfig | undefined) => {
  const defaultLogger = (data:any) => { return };
  const logger = (config && config.logger) || defaultLogger;
  return {


    before: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (handler.event.isBase64Encoded && handler.event.body) {
        logger('middy-base64decode::before - decoding base64');

        const buff = new Buffer(handler.event.body, 'base64');
        handler.event.body = buff.toString('ascii');
      }

      next();
    },

  };
};

export { compress, base64Decode };

export interface ICompressConfig {
  ignoreAcceptEncodingHeader?: boolean;
  verbose?: boolean;
  logger?: (args:any)=>void,
  zlibConfig?: ZlibOptions
}
