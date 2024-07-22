export interface DeviceMetadata {
    deviceId: string;
    topic: string[];
}

export interface Space {
    spaceName: string;
    devices: DeviceMetadata[]
}

export interface Home {
    homeId: string;
    spaces: Space[];
}
