import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED_MESSAGE } from "../consts";


/**
 * A middleware verifing the authorization header equals a pre defined secret
 * that must be set through the an env variable AUTH_SECRET
 * otherwise, it returns a 401 status code with a an appropriate message
 */
@Injectable()
export class AuthorizerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (process.env.AUTH_SECRET !== req.headers["authorization"]) {
            return res
                .status(401)
                .send(UNAUTHORIZED_MESSAGE);
        }
        return next();
    }   
}