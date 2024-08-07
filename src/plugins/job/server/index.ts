import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { MarkerType } from '@Shared/types/marker.js';
import { BlipColor } from '@Shared/types/blip.js';

const Rebar = useRebar();

declare global {
    export interface ServerPlugin {
        ['job-system']: ReturnType<typeof useJobSystem>;
    }
}

export type Job = {
    id: number;
    name: string;
    startTrigger: TriggerPoint;
    endTrigger: TriggerPoint;
    waypoints: Array<Waypoint>;
    rewardPerWaypoint: number;
    isRandom: boolean;
    sprite: number;
    vehicle?: alt.Vehicle;
};

type TriggerPoint = {
    location: alt.Vector3;
    type?: pointtype;
    action?: (player: alt.Player) => void;
};

type Waypoint = {
    id: number;
    location: alt.Vector3;
    possibleNextPoints?: Array<alt.Vector3>;
    type: pointtype;
    action?: (player: alt.Player) => void;
};

type pointtype = 'player' | 'vehicle';

type PlayerJobState = {
    jobId: number;
    currentWaypointIndex: number;
    isEndPointAssigned: boolean;
};

const jobs: Map<number, Job> = new Map();
const playerJobState: Map<alt.Player, PlayerJobState> = new Map();


function useJobSystem() {

    function addJob(job: Job) {
        jobs.set(job.id, job);
    }

    function startJob(player: alt.Player, jobId: number) {
        const job = jobs.get(jobId);
        if (job) {
            playerJobState.set(player, { jobId: job.id, currentWaypointIndex: 0, isEndPointAssigned: false });
            sendPlayerToNextWaypoint(player, job.waypoints[0]);
        }
        if(job.vehicle) {
            const jobvehicle = job.vehicle
            const newcar = new alt.Vehicle(jobvehicle.model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        }
    }

    function endJob(player: alt.Player) {
        playerJobState.delete(player);
    }

    function onPlayerReachWaypoint(player: alt.Player, waypointId: number) {
        const jobState = playerJobState.get(player);
        if (!jobState) return;

        const job = jobs.get(jobState.jobId);
        if (!job) return;

        const currentWaypoint = job.waypoints[jobState.currentWaypointIndex];
        if (currentWaypoint.id === waypointId) {
            if (currentWaypoint.action) {
                currentWaypoint.action(player);
            } else {
                defaultAction(player, job.rewardPerWaypoint);
            }

            jobState.currentWaypointIndex += 1;
            if (jobState.currentWaypointIndex >= job.waypoints.length && !jobState.isEndPointAssigned) {
                jobState.isEndPointAssigned = true;
                sendPlayerToEndPoint(player, job.endTrigger, job);
            } else if (jobState.isEndPointAssigned) {
                endJob(player);
                notifyPlayer(player, `你已经完成了工作: ${job.name}`);
            } else {
                const nextWaypoint = getNextWaypoint(currentWaypoint, job.isRandom, job);
                sendPlayerToNextWaypoint(player, nextWaypoint);
            }
        }
    }

    function defaultAction(player: alt.Player, reward: number) {
        rewardPlayer(player, reward);
        Rebar.player.useNotify(player).showNotification(`你完成了一个工作点，获得小费 ${reward}`);
    }

    function sendPlayerToNextWaypoint(player: alt.Player, waypoint: Waypoint) {
        Rebar.player.useNotify(player).showMissionText(`前往下一个工作点`);
        createWaypointInteraction(waypoint.location, waypoint.id, player);
    }

    function sendPlayerToEndPoint(player: alt.Player, endTrigger: TriggerPoint, job: Job) {
        Rebar.player.useNotify(player).showMissionText(`前往结束点: ${endTrigger.location}`);
        createEndPointInteraction(endTrigger, job.id, player, job.name);
    }

    async function rewardPlayer(player: alt.Player, reward: number) {
        const curren = await Rebar.useApi().getAsync('currency-api');
        curren.add({ player }, 'cash', reward);
        Rebar.player.useNotify(player).showNotification(`你获得了 ${reward} 金钱`);
    }

    function notifyPlayer(player: alt.Player, message: string) {
        Rebar.player.useNotify(player).showNotification(message);
    }

    return {
        addJob,
        startJob,
        endJob,
        onPlayerReachWaypoint,
    };
}

Rebar.useApi().register('job-system', useJobSystem);

export function createInteractionPoint(trigger: TriggerPoint, jobId: number, jobName: string) {
    const { location, action } = trigger;
    const job = jobs.get(jobId);

    const interaction = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(location.x, location.y, location.z - 1, 5, 2), 'any');

    const globalMarker = Rebar.controllers.useMarkerGlobal(
        {
            pos: new alt.Vector3(location.x, location.y, location.z),
            color: new alt.RGBA(255, 255, 255, 255),
            dimension: 0,
            scale: new alt.Vector3(1, 1, 1),
            type: MarkerType.CYLINDER,
        },
    );
    const blip = Rebar.controllers.useBlipGlobal({
        pos: new alt.Vector3(location.x, location.y, location.z),
        color: BlipColor.WHITE_1,
        sprite: job.sprite,
        shortRange: true,
        text: jobName,
    });

    interaction.onEnter(async (player) => {
        if (!player) return;
        const jobState = playerJobState.get(player);
        if (jobState && jobState.jobId === jobId) {
            const promptbar = await Rebar.useApi().getAsync('promptbar-api');
            promptbar.showPromptBar(player, `按E结束 ${jobName} 工作`);
        }
        const promptbar = await Rebar.useApi().getAsync('promptbar-api');
        promptbar.showPromptBar(player, `按E开始 ${jobName} 工作`);
    });

    interaction.onLeave(async (player) => {
        if (!player) return;
        const promptbar = await Rebar.useApi().getAsync('promptbar-api');
        promptbar.hidePromptBar(player);
    });

    interaction.on(async (player) => {
        if (player.vehicle) {
            return;
        }
        const jobState = playerJobState.get(player);
        if (jobState && jobState.jobId === jobId) {
            useJobSystem().endJob(player);
            Rebar.player.useNotify(player).showNotification(`结束工作: ${jobName}`);
            return;
        }
        if (action) {
            useJobSystem().startJob(player, jobId);
            Rebar.player.useNotify(player).showNotification(`开始工作: ${jobName}`);
            action(player);
        }
    });
}

export function createEndPointInteraction(trigger: TriggerPoint, jobId: number, player: alt.Player, jobName: string) {
    const { location, action } = trigger;
    const interaction = Rebar.controllers.useInteractionLocal(player, 'test', 'Cylinder', [
        location.x,
        location.y,
        location.z - 1,
        5,
        2,
    ]);

    interaction.onEnter(async (player) => {
        if (action) {
            action(player);
        } else {
            useJobSystem().endJob(player);
            Rebar.player.useNotify(player).showNotification(`完成工作: ${jobName}`);
        }
        interaction.destroy();
    });
}

export function createWaypointInteraction(pos: alt.Vector3, waypointId: number, player: alt.Player) {

    const waypoint = jobs.get(waypointId).waypoints[waypointId];

    const interaction = Rebar.controllers.useInteractionLocal(player, 'test', 'Cylinder', [
        pos.x,
        pos.y,
        pos.z - 1,
        5,
        2,
    ]);

    // Create the marker
    const marker = Rebar.controllers.useMarkerLocal(player, {
        pos: pos,
        color: new alt.RGBA(0, 200, 0, 255),
        dimension: 0,
        scale: new alt.Vector3(1, 1, 1),
        type: MarkerType.CYLINDER,
    });


    const blip = Rebar.controllers.useBlipLocal(player, {
        pos: pos,
        color: BlipColor.YELLOW,
        sprite: 57,
        shortRange: true,
        text: `undefined`,
    });


    interaction.onEnter(async (player, destroy) => {
        if (!player) return;
        if (waypoint.type === 'player') {
            if (player.vehicle) {
                return;
            }
            useJobSystem().onPlayerReachWaypoint(player, waypointId);
            interaction.destroy();
            marker.destroy();
            blip.destroy();
        }
        if (waypoint.type === 'vehicle') {
            if (player.vehicle) {
                useJobSystem().onPlayerReachWaypoint(player, waypointId);
                interaction.destroy();
                marker.destroy();
                blip.destroy();
            }
        }

    });
}

function getNextWaypoint(currentWaypoint: Waypoint, isRandom: boolean, job: Job): Waypoint {
    if (isRandom) {
        const randomIndex = Math.floor(Math.random() * currentWaypoint.possibleNextPoints!.length);
        const nextLocation = currentWaypoint.possibleNextPoints![randomIndex];
        return job.waypoints.find(wp => wp.location.x === nextLocation.x && wp.location.y === nextLocation.y && wp.location.z === nextLocation.z)!;
    } else {
        const nextLocation = currentWaypoint.possibleNextPoints![0];
        return job.waypoints.find(wp => wp.location.x === nextLocation.x && wp.location.y === nextLocation.y && wp.location.z === nextLocation.z)!;
    }
}

const taxiJob: Job = {
    id: 1,
    name: '出租车工作',
    vehicle: new alt.Vehicle('taxi', 100, 100, 100, 0, 0, 0),
    startTrigger: {
        location: new alt.Vector3(100, 100, 100),
        action: (player) => {
            Rebar.player.useNotify(player).showNotification(`你接到了出租车工作`);
        }
    },
    endTrigger: {
        location: new alt.Vector3(200, 200, 200),
        type:'vehicle',
        action: (player) => {
            Rebar.player.useNotify(player).showNotification(`你完成了出租车工作`);
        }
    },
    waypoints: [
        {
            id: 1,
            location: new alt.Vector3(150, 150, 150),
            type: 'vehicle',
            possibleNextPoints: [new alt.Vector3(250, 250, 250)],
            action: (player) => {
                player.vehicle.frozen = true;
                player.vehicle.frozen = false;
                Rebar.player.useNotify(player).showMissionText(`接到乘客，前往目的地`);
            }
        },
        {
            id: 2,
            location: new alt.Vector3(250, 250, 250),
            type: 'vehicle',
            possibleNextPoints: [new alt.Vector3(300, 300, 300)]
        }
    ],
    rewardPerWaypoint: 100,
    isRandom: false,
    sprite: 56
};

useJobSystem().addJob(taxiJob);

createInteractionPoint(taxiJob.startTrigger, taxiJob.id, taxiJob.name);








const RebarEvents = Rebar.events.useEvents();

RebarEvents.on('character-bound', (player) => {
    const rPlayer = Rebar.usePlayer(player);
    rPlayer.notify.showMissionText('Visit our website at https://rebarv.com', 100000);
});