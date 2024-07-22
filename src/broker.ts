import {connect as mqttConnect, IConnackPacket, IDisconnectPacket, MqttClient,} from "mqtt"

export class MirAIeBroker {
    private client: MqttClient;

    constructor(username: string,
                password: string,
                private readonly topics: string[]) {

        this.client = mqttConnect({
            host: "mqtt.miraie.in",
            port: 8883,
            clientId: this.generateClientId(),
            protocol: "mqtt",
            clean: true,
            username,
            password,
        });

        this.client.on("connect", this.onConnect);
        this.client.on("disconnect", (packet: IDisconnectPacket) => {
            console.log("disconnected", packet)

            if (packet.reasonCode != 0) {
                this.client.reconnect()
            }
        })
    }

    async close() {
        await this.client.endAsync()
    }

    private onConnect(packet: IConnackPacket) {
        console.log(packet)
    }

    private generateClientId() {
        return `an${this.generateRandom(16)}${this.generateRandom(5)}`
    }

    private generateRandom(length: number) {
        return Math.floor(Math.random() * Math.pow(10, length)).toString()
    }
}