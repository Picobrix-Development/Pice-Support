<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let language = 'KOR';
	let isUnityWebView = false;
	let uid = '';
	let locale = '';
	let env = '';

	$: if (browser && $page.url.searchParams) {
		uid = $page.url.searchParams.get('uid') || '';
		const urlLocale = $page.url.searchParams.get('locale') || '';
		const urlEnv = $page.url.searchParams.get('env') || '';

		if (uid && !isUnityWebView) {
			isUnityWebView = true;
		}

		if (urlLocale) {
			locale = urlLocale;
			if (urlLocale.startsWith('ko') || urlLocale.toLowerCase() === 'kor') {
				language = 'KOR';
			} else if (urlLocale.startsWith('en') || urlLocale.toLowerCase() === 'eng') {
				language = 'ENG';
			} else if (urlLocale.startsWith('ja') || urlLocale.toLowerCase() === 'jpn') {
				language = 'JPN';
			} else {
				language = 'ENG';
			}
		}

		if (urlEnv) {
			env = urlEnv;
			localStorage.setItem('pice_env', urlEnv);
		} else {
			env = localStorage.getItem('pice_env') || '';
		}
	}

	$: if (language) {
		if (language === 'KOR') locale = 'kor';
		else if (language === 'ENG') locale = 'eng';
		else if (language === 'JPN') locale = 'jpn';
	}

	// Card pack data - CMS에서 나중에 업데이트 가능하도록 데이터 분리
	const cardPacks = [
		{
			id: 'normal',
			star: 1,
			color: '#F5A623',
			bgColor: '#FFF8E1',
			borderColor: '#F5A623',
			image: '/images/pack_1star.png',
		},
		{
			id: 'rare',
			star: 2,
			color: '#4A90D9',
			bgColor: '#E3F2FD',
			borderColor: '#4A90D9',
			image: '/images/pack_2star.png',
		},
		{
			id: 'epic',
			star: 3,
			color: '#9B59B6',
			bgColor: '#F3E5F5',
			borderColor: '#9B59B6',
			image: '/images/pack_3star.png',
		},
		{
			id: 'legendary',
			star: 4,
			color: '#E91E63',
			bgColor: '#FCE4EC',
			borderColor: '#E91E63',
			image: '/images/pack_4star.png',
		},
	];

	// 확률 데이터 - CMS에서 업데이트 가능
	const oddsData = {
		normal: {
			guaranteed: { star: 1, count: 1 },
			rates: [
				{ star: 1, rate: 58.2 },
				{ star: 2, rate: 24.8 },
				{ star: 3, rate: 13.9 },
				{ star: 4, rate: 2.8 },
				{ star: 5, rate: 0.3 },
			]
		},
		rare: {
			guaranteed: { star: 2, count: 1 },
			rates: [
				{ star: 1, rate: 38.2 },
				{ star: 2, rate: 44.5 },
				{ star: 3, rate: 13.0 },
				{ star: 4, rate: 3.6 },
				{ star: 5, rate: 0.7 },
			]
		},
		epic: {
			guaranteed: { star: 3, count: 1 },
			rates: [
				{ star: 1, rate: 30.6 },
				{ star: 2, rate: 30.6 },
				{ star: 3, rate: 30.6 },
				{ star: 4, rate: 7.0 },
				{ star: 5, rate: 1.2 },
			]
		},
		legendary: {
			guaranteed: { star: 4, count: 1 },
			rates: [
				{ star: 1, rate: 20.0 },
				{ star: 2, rate: 25.0 },
				{ star: 3, rate: 30.0 },
				{ star: 4, rate: 20.0 },
				{ star: 5, rate: 5.0 },
			]
		},
	};

	// Min 값 데이터 - CMS에서 업데이트 가능
	const minData = [
		{ min: 1, description_key: 'min_1_desc' },
		{ min: 2, description_key: 'min_2_desc' },
		{ min: 3, description_key: 'min_3_desc' },
		{ min: 4, description_key: 'min_4_desc' },
		{ min: 5, description_key: 'min_5_desc' },
	];

	const translations = {
		KOR: {
			page_title: '카드팩 확률 정보',
			page_subtitle: '카드팩별 획득 확률 안내',
			section_packs: '카드팩 종류',
			section_odds: '등급별 획득 확률',
			section_system: '카드팩 시스템 안내',
			star_label: '성',
			rate_label: '확률',
			guaranteed_label: '보장',
			guaranteed_desc: '{star}성 카드 {count}장 이상 획득 확률 100%',
			additional_rates: '추가 카드 획득 확률',
			pack_normal: '일반 팩',
			pack_rare: '레어 팩',
			pack_epic: '에픽 팩',
			pack_legendary: '레전더리 팩',
			system_title_1: '카드팩 구성',
			system_desc_1: '카드팩에 포함된 크라운 수에 상응하는 카드를 최소 1장 이상 획득할 확률이 100%입니다.',
			system_title_2: 'Min 값 안내',
			system_desc_2: '각 카드팩은 최소 보장 등급(Min)이 있으며, 해당 등급 이상의 카드가 반드시 포함됩니다.',
			min_1_desc: '최소 1성 카드 1장 보장',
			min_2_desc: '최소 2성 카드 1장 보장',
			min_3_desc: '최소 3성 카드 1장 보장',
			min_4_desc: '최소 4성 카드 1장 보장',
			min_5_desc: '최소 5성 카드 1장 보장',
			new_badge_title: 'NEW 카드',
			new_badge_desc: "'새로운'이라고 표시된 카드 팩은 구매한 팩의 종류에 해당하는 카드 중 플레이어의 앨범에 없는 카드가 포함되어 있음을 보장합니다.",
			note_title: '참고사항',
			note_1: '정확한 확률은 레벨, 게임 진행 상황, 위치한 스테이지 등 다양한 요소에 따라 달라질 수 있습니다.',
			note_2: '확률은 각 카드 슬롯별로 독립적으로 적용됩니다.',
			note_3: '보장 카드는 확률과 별개로 반드시 포함됩니다.',
			language_name: '한국어',
		},
		ENG: {
			page_title: 'Card Pack Odds Info',
			page_subtitle: 'Drop rates for each card pack',
			section_packs: 'Card Pack Types',
			section_odds: 'Drop Rates by Grade',
			section_system: 'Card Pack System Guide',
			star_label: 'Star',
			rate_label: 'Rate',
			guaranteed_label: 'Guaranteed',
			guaranteed_desc: '100% chance to get at least {count} card(s) of {star}-star or higher',
			additional_rates: 'Additional Card Drop Rates',
			pack_normal: 'Normal Pack',
			pack_rare: 'Rare Pack',
			pack_epic: 'Epic Pack',
			pack_legendary: 'Legendary Pack',
			system_title_1: 'Card Pack Composition',
			system_desc_1: 'Each card pack guarantees at least one card corresponding to the number of crowns included in the pack.',
			system_title_2: 'Min Value Guide',
			system_desc_2: 'Each card pack has a minimum guaranteed grade (Min), ensuring at least one card of that grade or higher is included.',
			min_1_desc: 'Guaranteed at least 1x 1-star card',
			min_2_desc: 'Guaranteed at least 1x 2-star card',
			min_3_desc: 'Guaranteed at least 1x 3-star card',
			min_4_desc: 'Guaranteed at least 1x 4-star card',
			min_5_desc: 'Guaranteed at least 1x 5-star card',
			new_badge_title: 'NEW Card',
			new_badge_desc: "Card packs marked as 'New' guarantee that they contain a card not yet in the player's album, from the corresponding pack type.",
			note_title: 'Notes',
			note_1: 'Actual rates may vary depending on level, game progress, current stage, and other factors.',
			note_2: 'Rates are applied independently to each card slot.',
			note_3: 'Guaranteed cards are included regardless of the drop rates.',
			language_name: 'English',
		},
		JPN: {
			page_title: 'カードパック確率情報',
			page_subtitle: 'カードパック別獲得確率のご案内',
			section_packs: 'カードパックの種類',
			section_odds: 'グレード別獲得確率',
			section_system: 'カードパックシステムガイド',
			star_label: '星',
			rate_label: '確率',
			guaranteed_label: '保証',
			guaranteed_desc: '{star}星カード{count}枚以上獲得確率100%',
			additional_rates: '追加カード獲得確率',
			pack_normal: 'ノーマルパック',
			pack_rare: 'レアパック',
			pack_epic: 'エピックパック',
			pack_legendary: 'レジェンダリーパック',
			system_title_1: 'カードパック構成',
			system_desc_1: 'カードパックに含まれるクラウン数に相応するカードを最低1枚以上獲得する確率は100%です。',
			system_title_2: 'Min値ガイド',
			system_desc_2: '各カードパックには最低保証グレード（Min）があり、そのグレード以上のカードが必ず含まれます。',
			min_1_desc: '最低1星カード1枚保証',
			min_2_desc: '最低2星カード1枚保証',
			min_3_desc: '最低3星カード1枚保証',
			min_4_desc: '最低4星カード1枚保証',
			min_5_desc: '最低5星カード1枚保証',
			new_badge_title: 'NEWカード',
			new_badge_desc: "「新しい」と表示されたカードパックは、購入したパックの種類に該当するカードの中で、プレイヤーのアルバムにないカードが含まれていることを保証します。",
			note_title: '注意事項',
			note_1: '正確な確率はレベル、ゲーム進行状況、現在のステージなど、さまざまな要因によって異なる場合があります。',
			note_2: '確率は各カードスロットごとに独立して適用されます。',
			note_3: '保証カードは確率とは別に必ず含まれます。',
			language_name: '日本語',
		}
	};

	$: currentTranslations = translations[language] || translations['ENG'];
	$: t = (key) => currentTranslations?.[key] || key;

	function getPackName(packId) {
		return t(`pack_${packId}`);
	}

	function getGuaranteedText(pack) {
		const data = oddsData[pack.id];
		if (!data) return '';
		return t('guaranteed_desc')
			.replace('{star}', data.guaranteed.star)
			.replace('{count}', data.guaranteed.count);
	}

	function renderStars(count) {
		return '★'.repeat(count) + '☆'.repeat(5 - count);
	}
</script>

<svelte:head>
	<title>{t('page_title')} - Pice Console</title>
</svelte:head>

<div class="page-container">
	<!-- Header -->
	<div class="header">
		{#if !isUnityWebView}
			<div class="language-selector-wrapper">
				<select bind:value={language} class="language-selector">
					<option value="KOR">한국어</option>
					<option value="ENG">English</option>
					<option value="JPN">日本語</option>
				</select>
			</div>
		{/if}

		<div class="header-content">
			<h1 class="header-title">{t('page_title')}</h1>
			<p class="header-subtitle">{t('page_subtitle')}</p>
		</div>
	</div>

	<div class="content-container">
		<!-- Card Pack Types -->
		<section class="section">
			<h2 class="section-title">{t('section_packs')}</h2>
			<div class="pack-grid">
				{#each cardPacks as pack}
					<div class="pack-card" style="border-color: {pack.borderColor};">
						<div class="pack-image-wrapper" style="background-color: {pack.bgColor};">
							<img src={pack.image} alt="{getPackName(pack.id)}" class="pack-image" />
						</div>
						<div class="pack-info">
							<span class="pack-name">{getPackName(pack.id)}</span>
							<span class="pack-stars" style="color: {pack.color};">{renderStars(pack.star)}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Odds Tables -->
		<section class="section">
			<h2 class="section-title">{t('section_odds')}</h2>

			{#each cardPacks as pack}
				{@const odds = oddsData[pack.id]}
				<div class="odds-card">
					<div class="odds-header" style="background-color: {pack.bgColor}; border-left: 4px solid {pack.borderColor};">
						<span class="odds-pack-name" style="color: {pack.color};">{getPackName(pack.id)}</span>
						<span class="odds-guaranteed-badge">
							{t('guaranteed_label')}: {odds.guaranteed.star}{t('star_label')} x{odds.guaranteed.count}
						</span>
					</div>

					<div class="odds-body">
						<p class="guaranteed-text">{getGuaranteedText(pack)}</p>

						<p class="additional-label">{t('additional_rates')}</p>
						<table class="odds-table">
							<thead>
								<tr>
									<th>{t('star_label')}</th>
									<th>{t('rate_label')}</th>
								</tr>
							</thead>
							<tbody>
								{#each odds.rates as row}
									<tr>
										<td>
											<span class="star-display" class:star-5={row.star === 5} class:star-4={row.star === 4} class:star-3={row.star === 3}>
												{renderStars(row.star)} ({row.star}{t('star_label')})
											</span>
										</td>
										<td>
											<div class="rate-cell">
												<div class="rate-bar-bg">
													<div class="rate-bar" style="width: {row.rate}%; background-color: {pack.color};"></div>
												</div>
												<span class="rate-value">{row.rate}%</span>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}
		</section>

		<!-- System Guide -->
		<section class="section">
			<h2 class="section-title">{t('section_system')}</h2>

			<!-- Min Value -->
			<div class="info-card">
				<h3 class="info-title">{t('system_title_2')}</h3>
				<p class="info-desc">{t('system_desc_2')}</p>
				<div class="min-list">
					{#each minData as item}
						<div class="min-item">
							<span class="min-badge">Min {item.min}</span>
							<span class="min-desc">{t(item.description_key)}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- NEW Badge -->
			<div class="info-card new-card">
				<div class="new-badge-header">
					<span class="new-badge">NEW</span>
					<h3 class="info-title">{t('new_badge_title')}</h3>
				</div>
				<p class="info-desc">{t('new_badge_desc')}</p>
			</div>

			<!-- Notes -->
			<div class="info-card notes-card">
				<h3 class="info-title">{t('note_title')}</h3>
				<ul class="notes-list">
					<li>{t('note_1')}</li>
					<li>{t('note_2')}</li>
					<li>{t('note_3')}</li>
				</ul>
			</div>
		</section>
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		background-color: #f5f5f7;
	}

	/* Header */
	.header {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
		padding: 40px 20px 32px;
		position: relative;
	}

	.header-content {
		text-align: center;
	}

	.header-title {
		font-size: 28px;
		font-weight: 800;
		color: white;
		margin: 0 0 8px 0;
	}

	.header-subtitle {
		font-size: 15px;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.language-selector-wrapper {
		position: absolute;
		top: 16px;
		right: 16px;
		z-index: 20;
	}

	.language-selector {
		padding: 6px 28px 6px 12px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.15);
		color: white;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		appearance: none;
		background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/%3E%3C/svg%3E');
		background-repeat: no-repeat;
		background-position: right 6px center;
		background-size: 18px;
	}

	.language-selector option {
		color: #1f2937;
		background: white;
	}

	/* Content */
	.content-container {
		max-width: 640px;
		margin: 0 auto;
		padding: 24px 16px 40px;
	}

	/* Section */
	.section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 16px 0;
		padding-left: 12px;
		border-left: 3px solid #3b82f6;
	}

	/* Pack Grid */
	.pack-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.pack-card {
		background: white;
		border-radius: 16px;
		padding: 16px;
		border: 2px solid;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.pack-image-wrapper {
		width: 80px;
		height: 80px;
		border-radius: 12px;
		margin: 0 auto 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pack-image {
		width: 64px;
		height: 64px;
		object-fit: contain;
	}

	.pack-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.pack-name {
		font-size: 14px;
		font-weight: 700;
		color: #1f2937;
	}

	.pack-stars {
		font-size: 12px;
		letter-spacing: 1px;
	}

	/* Odds Card */
	.odds-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.odds-header {
		padding: 14px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.odds-pack-name {
		font-size: 16px;
		font-weight: 700;
	}

	.odds-guaranteed-badge {
		font-size: 11px;
		font-weight: 600;
		color: #059669;
		background: #ecfdf5;
		padding: 4px 10px;
		border-radius: 20px;
		white-space: nowrap;
	}

	.odds-body {
		padding: 16px;
	}

	.guaranteed-text {
		font-size: 13px;
		color: #6b7280;
		margin: 0 0 14px 0;
		padding: 10px 12px;
		background: #f9fafb;
		border-radius: 8px;
		line-height: 1.5;
	}

	.additional-label {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 8px 0;
	}

	/* Odds Table */
	.odds-table {
		width: 100%;
		border-collapse: collapse;
	}

	.odds-table th {
		font-size: 12px;
		font-weight: 600;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 6px 8px;
		text-align: left;
		border-bottom: 1px solid #f3f4f6;
	}

	.odds-table td {
		padding: 10px 8px;
		border-bottom: 1px solid #f3f4f6;
		vertical-align: middle;
	}

	.odds-table tr:last-child td {
		border-bottom: none;
	}

	.star-display {
		font-size: 13px;
		color: #374151;
		white-space: nowrap;
	}

	.star-5 {
		color: #E91E63;
		font-weight: 700;
	}

	.star-4 {
		color: #9B59B6;
		font-weight: 600;
	}

	.star-3 {
		color: #7C3AED;
		font-weight: 600;
	}

	.rate-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.rate-bar-bg {
		flex: 1;
		height: 8px;
		background: #f3f4f6;
		border-radius: 4px;
		overflow: hidden;
	}

	.rate-bar {
		height: 100%;
		border-radius: 4px;
		transition: width 0.6s ease;
	}

	.rate-value {
		font-size: 14px;
		font-weight: 700;
		color: #1f2937;
		min-width: 48px;
		text-align: right;
	}

	/* Info Cards */
	.info-card {
		background: white;
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.info-title {
		font-size: 16px;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 8px 0;
	}

	.info-desc {
		font-size: 14px;
		color: #6b7280;
		line-height: 1.6;
		margin: 0 0 12px 0;
	}

	/* Min List */
	.min-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.min-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: #f9fafb;
		border-radius: 10px;
	}

	.min-badge {
		font-size: 12px;
		font-weight: 700;
		color: white;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		padding: 4px 10px;
		border-radius: 8px;
		white-space: nowrap;
	}

	.min-desc {
		font-size: 13px;
		color: #374151;
	}

	/* NEW Badge */
	.new-card {
		border: 2px solid #ef4444;
		border-style: dashed;
	}

	.new-badge-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.new-badge {
		font-size: 11px;
		font-weight: 800;
		color: white;
		background: #ef4444;
		padding: 3px 8px;
		border-radius: 6px;
		letter-spacing: 0.5px;
	}

	.new-badge-header .info-title {
		margin: 0;
	}

	/* Notes */
	.notes-card {
		background: #fffbeb;
		border: 1px solid #fde68a;
	}

	.notes-card .info-title {
		color: #92400e;
	}

	.notes-list {
		margin: 0;
		padding: 0 0 0 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.notes-list li {
		font-size: 13px;
		color: #78350f;
		line-height: 1.5;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.header {
			padding: 32px 16px 24px;
		}

		.header-title {
			font-size: 24px;
		}

		.header-subtitle {
			font-size: 13px;
		}

		.content-container {
			padding: 20px 12px 32px;
		}

		.pack-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}

		.pack-card {
			padding: 12px;
		}

		.pack-image-wrapper {
			width: 64px;
			height: 64px;
		}

		.pack-image {
			width: 48px;
			height: 48px;
		}
	}

	@media (max-width: 360px) {
		.header-title {
			font-size: 20px;
		}

		.odds-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 6px;
		}

		.rate-cell {
			gap: 6px;
		}

		.rate-value {
			font-size: 12px;
			min-width: 40px;
		}
	}
</style>
