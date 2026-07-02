// Eager, tiny bootstrap for the IoT Hub install dialog. Wires a single
// delegated click listener; the heavy dialog module (markup, icons,
// scroll-lock, iot-hub model) is dynamic-imported on the first trigger click
// so it stays out of the initial-load graph.
//
// Imported by InstallButton.astro as a bundled (dedup'd) module script, so it
// runs exactly once per page regardless of how many install buttons render —
// that single-listener guarantee is what makes the delegated handler safe.

declare global {
	interface Window {
		__tbInstallDialogInit?: boolean;
	}
}

function onTriggerClick(e: MouseEvent): void {
	const trigger = (e.target as Element).closest<HTMLElement>(
		'[data-iot-hub-install-trigger]'
	);
	if (!trigger) return;
	// The card button is nested inside the card's <a> — block navigation
	// synchronously, before the async import resolves, so the first click is
	// never lost to a page navigation.
	e.preventDefault();
	e.stopPropagation();
	void import('@components/IotHub/install-dialog').then((m) =>
		m.openFor({
			slug: trigger.dataset.slug ?? '',
			itemType: trigger.dataset.itemType ?? '',
			affiliateId: trigger.dataset.affiliateId || null,
		})
	);
}

function boot(): void {
	document.addEventListener('click', onTriggerClick);
}

if (typeof window !== 'undefined' && !window.__tbInstallDialogInit) {
	window.__tbInstallDialogInit = true;
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot, { once: true });
	} else {
		boot();
	}
}

export {};
