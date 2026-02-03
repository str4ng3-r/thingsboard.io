import type { APIRoute } from 'astro';
import devices from '../../data/devices.json';

export const GET: APIRoute = async () => {
	return new Response(
		JSON.stringify(devices), {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
};
