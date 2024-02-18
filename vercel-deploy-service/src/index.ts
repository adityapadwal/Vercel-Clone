import { createClient, commandOptions } from "redis";
const subscriber = createClient();
subscriber.connect();

import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

// an infinitely running for loop that pulls values from the redis queue
async function main() {
    while (1) {
        const response = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        );
        // @ts-ignore
        const id = response.element;
        console.log(response);
        await downloadS3Folder(`output/${id}`);
        console.log("downloaded");

        await buildProject(id);

        copyFinalDist(id);
    }
}
main();