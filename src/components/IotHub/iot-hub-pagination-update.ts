// Runtime updater for PaginationLink. When the host (dynamic search page,
// future dynamic category pages) flips a pagination nav into dynamic mode,
// it calls `updatePaginationDynamic(nav, { currentPage, totalPages })` to
// rebuild the page-number list with event-based buttons. Clicks dispatch
// `iot-hub-page:change` { page } bubbling events on the nav root — the
// host listens and refetches.

interface PaginationState {
	currentPage: number;
	totalPages: number;
}

// Same page-list algorithm as the static buildPages() in PaginationLink.astro
// so the dynamic UI keeps the same ellipsis ranges users are used to.
function buildPages(current: number, total: number): Array<number | 'ellipsis'> {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const result: Array<number | 'ellipsis'> = [1];
	if (current > 3) result.push('ellipsis');
	for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
		result.push(p);
	}
	if (current < total - 2) result.push('ellipsis');
	result.push(total);
	return result;
}

const CHEVRON_PATHS = {
	left: 'm15 6-6 6 6 6',
	right: 'm9 6 6 6-6 6',
};

function chevronSvgHtml(direction: 'left' | 'right'): string {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${CHEVRON_PATHS[direction]}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

// Anchor-based factories (not <button>) keep dynamic-mode controls
// visually identical to their static-render counterparts — sidesteps
// the UA `<button>` defaults (font-family, appearance, :disabled colour)
// that would otherwise need ad-hoc resets in the SCSS. Clicks
// preventDefault + dispatch `iot-hub-page:change`.

function makeChevron(
	direction: 'left' | 'right',
	enabled: boolean,
	targetPage: number,
	label: string
): HTMLElement {
	const a = document.createElement('a');
	a.className = `iot-hub-pagination__chevron${enabled ? '' : ' is-disabled'}`;
	a.setAttribute('aria-label', label);
	a.setAttribute('rel', direction === 'left' ? 'prev' : 'next');
	a.href = '#';
	if (!enabled) a.setAttribute('aria-disabled', 'true');
	a.innerHTML = chevronSvgHtml(direction);
	a.addEventListener('click', (e) => {
		e.preventDefault();
		if (!enabled) return;
		dispatchPageChange(a, targetPage);
	});
	return a;
}

function makePageButton(page: number, isCurrent: boolean): HTMLElement {
	const a = document.createElement('a');
	a.className = `iot-hub-pagination__page${isCurrent ? ' is-current' : ''}`;
	a.href = '#';
	if (isCurrent) a.setAttribute('aria-current', 'page');
	a.textContent = String(page);
	a.addEventListener('click', (e) => {
		e.preventDefault();
		if (isCurrent) return;
		dispatchPageChange(a, page);
	});
	return a;
}

function dispatchPageChange(el: HTMLElement, page: number): void {
	el.dispatchEvent(
		new CustomEvent('iot-hub-page:change', {
			detail: { page },
			bubbles: true,
		})
	);
}

export function updatePaginationDynamic(
	nav: HTMLElement,
	{ currentPage, totalPages }: PaginationState
): void {
	nav.dataset.dynamicMode = 'true';

	// Rebuild the "numbers" list (desktop layout).
	const numbersList = nav.querySelector<HTMLUListElement>(
		'.iot-hub-pagination__pages--numbers'
	);
	if (numbersList) {
		numbersList.replaceChildren();
		const prevLi = document.createElement('li');
		prevLi.appendChild(
			makeChevron('left', currentPage > 1, currentPage - 1, 'Previous page')
		);
		numbersList.appendChild(prevLi);
		for (const item of buildPages(currentPage, totalPages)) {
			const li = document.createElement('li');
			if (item === 'ellipsis') {
				li.className = 'iot-hub-pagination__ellipsis';
				li.setAttribute('aria-hidden', 'true');
				li.textContent = '…';
			} else {
				li.appendChild(makePageButton(item, item === currentPage));
			}
			numbersList.appendChild(li);
		}
		const nextLi = document.createElement('li');
		nextLi.appendChild(
			makeChevron('right', currentPage < totalPages, currentPage + 1, 'Next page')
		);
		numbersList.appendChild(nextLi);
	}

	// Rebuild the compact summary row (mobile layout).
	const compact = nav.querySelector<HTMLElement>(
		'.iot-hub-pagination__pages--compact'
	);
	if (compact) {
		compact.replaceChildren();
		compact.appendChild(
			makeChevron('left', currentPage > 1, currentPage - 1, 'Previous page')
		);
		const summary = document.createElement('span');
		summary.className = 'iot-hub-pagination__summary';
		summary.textContent = `Page ${currentPage} of ${totalPages}`;
		compact.appendChild(summary);
		compact.appendChild(
			makeChevron('right', currentPage < totalPages, currentPage + 1, 'Next page')
		);
	}
}

// Set the host-visible "totalResults" line and rebuild pagination together.
// The search page hosts both, so this helper keeps them in lockstep.
export function updateResultsCount(countEl: HTMLElement, totalResults: number): void {
	const word = totalResults === 1 ? 'result' : 'results';
	countEl.textContent = `${totalResults} ${word}`;
}
