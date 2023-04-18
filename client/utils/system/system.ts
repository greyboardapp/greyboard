export enum OperatingSystem {
    Windows,
    Linux,
    Mac,
}

export function getOperatingSystem() : OperatingSystem {
    const os = window.navigator.platform;
    if (os.includes("Win"))
        return OperatingSystem.Windows;
    if (os.includes("Mac"))
        return OperatingSystem.Mac;
    return OperatingSystem.Linux;
}
