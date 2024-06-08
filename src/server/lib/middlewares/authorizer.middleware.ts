import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const UNAUTHORIZED_MESSAGE = "Unauthorized request";

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