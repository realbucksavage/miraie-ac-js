import axios from "axios";
import {MirAIeBroker} from "./broker";
import {Home} from "./model";
import {HOMES_URL, HTTP_CLIENT_ID, LOGIN_URL} from "./constants";

export type LoginType = "mobile" | "email" | "username"

export class UnauthorizedError extends Error {
    constructor(status: number, response: any) {
        super();
        this.message = `unauthorized ${status}: ${response}`;
    }
}

interface User {
    accessToken: string;
    refreshToken: string;
    userId: string;
    expiresIn: number;
}


export class MirAIeClient {
    private user: User | undefined;
    private home: Home | undefined;
    private broker: MirAIeBroker | undefined;

    constructor(private readonly loginType: LoginType,
                private readonly login: string,
                private readonly password: string) {
    }

    async init() {
        this.user = await this.authenticate();
        this.home = await this.getHome();

        const topics: string[] = [];
        this.home.spaces.forEach(space => {
            space.devices.forEach(device => {
                topics.push(`${device.topic}/status`);
                topics.push(`${device.topic}/connectionStatus`);
            })
        });

        this.broker = new MirAIeBroker(this.home.homeId, this.user.accessToken, topics);

        return Promise.resolve(this);
    }

    async close() {
        await this.broker?.close()
    }

    private async authenticate() {
        const login_request = {
            [this.loginType]: this.login,
            "clientId": HTTP_CLIENT_ID,
            "password": this.password,
            "scope": this.getScope(),
        }

        const headers = {"Content-Type": "application/json"};
        const response = await axios.post(LOGIN_URL, login_request, {headers})
        if (response.status != 200) {
            throw new UnauthorizedError(response.status, response.data)
        }

        return Promise.resolve(response.data as User);
    }

    private async getHome() {
        const response = await axios.get(HOMES_URL, {headers: this.buildHttpHeaders()});
        return response.data[0] as Home;
    }

    private buildHttpHeaders() {
        return {
            "Authorization": `Bearer ${this.user?.accessToken}`,
            "Content-Type": "application/json",
        }
    }

    private getScope() {
        const rnd = Math.floor(Math.random() * 1000000000)
        return `an${rnd}`
    }
}