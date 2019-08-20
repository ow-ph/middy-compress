import middy from 'middy';
import {gzip} from 'node-gzip';

const compress: middy.Middleware<ICompressConfig> = (config: ICompressConfig | undefined) => {
  const defaultLogger = (data:any) => { };
  const logger = (config && config.logger) || defaultLogger;
  return {
    after: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (!handler.response.body){
        logger('middy-compress::after - no body to gzip');
        next();
        return;
      }
      gzip(handler.response.body)
        .then(response=>{
          handler.response.body = response.toString('base64');
          handler.response.isBase64Encoded = true;
          handler.response.headers = handler.response.headers || {};
          handler.response.headers["Content-Encoding"] = "gzip";

          logger('middy-compress::after - content g zipped');

          next();
        })
        .catch(err=> {
          logger('middy-compress::after - error');
          logger(err);
          next(err)
        });
    },

    before: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (handler.event.isBase64Encoded && handler.event.body) {
        logger('middy-compress::before - decoding base64');

        const buff = new Buffer(handler.event.body, 'base64');
        handler.event.body = buff.toString('ascii');
      }

      next();
    },

  };
};

export { compress };

export interface ICompressConfig {
  ignoreAcceptEncodingHeader?: boolean;
  verbose?: boolean;
  logger?: (args:any)=>void
}
