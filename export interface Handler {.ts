export interface Handler {
    setNext(handler: Handler): Handler;

    handle(request: string): string;
}
import { Handler } from "./handler";

export abstract class AbstractHandler implements Handler {
    private nextHandler: Handler;

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(request: string): string {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }

        return null;
    }
}
import { AbstractHandler } from "./abstract-handler";

export class HandlerA extends AbstractHandler {
    public handle(request: string): string {
        if (request === "optionA") {
            return `A: I'll do the operation -> ${request}.`;
        }
        return super.handle(request);
    }
}

/***/
import { AbstractHandler } from "./abstract-handler";

export class HandlerB extends AbstractHandler {
    public handle(request: string): string {
        if (request === "optionB") {
            return `B: I'll do the operation -> ${request}.`;
        }
        return super.handle(request);
    }
}

/***/
import { AbstractHandler } from "./abstract-handler";

export class HandlerC extends AbstractHandler {
    public handle(request: string): string {
        if (request === "optionC") {
            return `C: I'll do the operation -> ${request}.`;
        }
        return super.handle(request);
    }
}
import { Handler } from "./handler";
import { HandlerA } from "./handlerA";
import { HandlerB } from "./handlerB";
import { HandlerC } from "./handlerC";

function clientCode(handler: Handler) {
    const options = ["optionA", "optionB", "optionC"];

    for (const option of options) {
        console.log(`Client: Who does ${option}?`);

        const result = handler.handle(option);
        const message = result ? result : `${option} was left untouched.`;
        console.log(message);
    }
}


const handlerA = new HandlerA();
const handlerB = new HandlerB();
const handlerC = new HandlerC();

handlerA.setNext(handlerB).setNext(handlerC);

console.log("Chain: handlerA > handlerB > handlerC\n");
clientCode(handlerA);
console.log("");

console.log("Subchain: handlerB > handlerC\n");
clientCode(handlerB);
export const USERS = {
    ADMIN: {
        email: "admin@example.com",
        password: "admin",
    },
    USER: {
        email: "user@example.com",
        password: "user",
    },
};

export const REQUEST_PER_MINUTE = 2;
export const WAIT_TIME = 60_000;
import { User } from "./user.interface";

export interface Handler {
    setNextMiddleware(handler: Handler): void;

    execute(user: User): boolean;
}
export interface User {
    email: string;
    password: string;
}
import { Handler, User } from "../interfaces";

export abstract class Middleware implements Handler {
    private next: Handler;

    public setNextMiddleware(next: Handler): Handler {
        this.next = next;
        return next;
    }
    public abstract execute(user: User): boolean;

    protected checkNext(user: User): boolean {
        if (!this.next) {
            return true;
        }
        return this.next.execute(user);
    }
}
import { Middleware } from "./middleware";
import { Server } from "../server";
import { User } from "../interfaces";

export class UserExistsMiddleware extends Middleware {
    public constructor(private server: Server) {
        super();
    }

    public execute({ email, password }: User): boolean {
        if (!this.server.hasEmail(email)) {
            console.log("This email is not registered!");
            return false;
        }
        if (!this.server.isValidPassword(email, password)) {
            console.log("Wrong password!");
            return false;
        }
        return this.checkNext({ email, password });
    }
}
import { Middleware } from "./middleware";
import { User } from "../interfaces";
import { WAIT_TIME } from "../app.constants";

export class ThrottlingMiddleware extends Middleware {
    private request: number = 0;
    private currentTime: number = new Date().getTime();
    private requestPerMinute: number;

    constructor(requestPerMinute: number) {
        super();
        this.requestPerMinute = requestPerMinute;
    }

    public execute(user: User): boolean {
        const now = new Date().getTime();
        const limitTime = this.currentTime + WAIT_TIME;

        if (now > limitTime) {
            this.request = 0;
            this.currentTime = now;
        }

        this.request++;

        if (this.request > this.requestPerMinute) {
            console.log("Request limit exceeded!");
            return false;
        }
        return this.checkNext(user);
    }
}
export class RoleMiddleware extends Middleware {
    public execute({ email, password }: User): boolean {
        if (email === USERS.ADMIN.email) {
            console.log("Hello, admin!");
            return true;
        }
        console.log("Hello, user!");
        return this.checkNext({ email, password });
    }
}
import { Middleware } from "./middlewares";
import { User } from "./interfaces";

export class Server {
    private users: Map<string, User> = new Map<string, User>();
    private middleware: Middleware;

    public setMiddleware(middleware: Middleware): void {
        this.middleware = middleware;
    }

    public logIn(email: string, password: string): boolean {
        if (this.middleware.execute({ email, password })) {
            console.log("Authorization have been successful!");

            return true;
        }
        return false;
    }

    public register(email: string, password: string): void {
        const user: User = {
            email,
            password,
        };
        this.users.set(email, user);
    }

    public hasEmail(email: string): boolean {
        return this.users.has(email);
    }

    public isValidPassword(email: string, password: string): boolean {
        const user = this.users.get(email);
        return user.password === password;
    }
} import {
    Middleware,
    RoleMiddleware,
    ThrottlingMiddleware,
    UserExistsMiddleware,
} from "./middlewares";
import { REQUEST_PER_MINUTE, USERS } from "./app.constants";

import { Server } from "./server";

const readline = require("readline-sync");

const server = new Server();
server.register(USERS.ADMIN.email, USERS.ADMIN.password);
server.register(USERS.USER.email, USERS.USER.password);

const middleware: Middleware = new ThrottlingMiddleware(REQUEST_PER_MINUTE);
middleware
    .setNextMiddleware(new UserExistsMiddleware(server))
    .setNextMiddleware(new RoleMiddleware());

server.setMiddleware(middleware);

while (true) {
    let success = false;

    do {
        console.log("....Autentication Software....");
        const email = readline.question("Email: ");
        const password = readline.question("Password: ", { hideEchoBack: true });
        success = server.logIn(email, password);
    } while (!success);
}