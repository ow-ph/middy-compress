import middy from 'middy';
import {gzip} from 'node-gzip';

const compress: middy.Middleware<ICompressConfig> = (config: ICompressConfig | undefined) => {
  return {
    after: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (!handler.response.body){
        next();
        return;
      }
      gzip(handler.response.body)
        .then(response=>{
          handler.response.body = response.toString('base64');
          handler.response.isBase64Encoded = true;
          handler.response.headers = handler.response.headers || {};
          handler.response.headers["Content-Encoding"] = "gzip";
          next();
        })
        .catch(err=>next(err));
    },

    before: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (handler.event.isBase64Encoded && handler.event.body) {
        const buff = new Buffer(handler.event.body, 'base64');
        handler.event.body = buff.toString('ascii');
      }

      next();
    },

    onError: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
      if (!handler.response.body){
        next(handler.error);
        return;
      }
      
      gzip(handler.response.body)
        .then(response=>{
          handler.response.body = response.toString('base64');
          handler.response.isBase64Encoded = true;
          handler.response.headers = handler.response.headers || {};
          handler.response.headers["Content-Encoding"] = "gzip";
          next(handler.error);
        })
        .catch(err=>next(handler.error));
    },

  };
};

export { compress };

export interface ICompressConfig {
  ignoreAcceptEncodingHeader?: boolean;
  verbose?: boolean;
}
