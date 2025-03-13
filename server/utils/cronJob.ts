import { CronJob, } from 'cron';

type Options = {
	schedule: string;
	jobFunction: () => void | Promise<void>
	autoStart?: boolean;
}

export const createCronJob = ({schedule, jobFunction, autoStart = false}: Options) => {
	return CronJob.from({
		cronTime: schedule,
		onTick: jobFunction,
		start: autoStart,
		timeZone: 'system',
	});
};
