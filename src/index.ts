import middy from 'middy';
import {gzip} from 'node-gzip';

const compress: middy.Middleware<ICompressConfig> = (config: ICompressConfig | undefined) => {
  return {
    after: (handler:middy.HandlerLambda<any,any>, next: middy.NextFunction) => {
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
  };
};

export { compress };

export interface ICompressConfig {
  ignoreAcceptEncodingHeader?: boolean;
}
