<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { formatKoreanDate } from '$lib/utils/dateFormat';
	import api from '$lib/api';

	// Tab state
	let activeTab = 'inquiry';
	let language = 'KOR';
	let isUnityWebView = false;

	// Form data
	let formData = {
		user_uid: '',
		inquiry_type: '',
		email: '',
		title: '',
		content: '',
		privacy_consent: false,
		language: 'KOR'
	};

	// State
	let isSubmitting = false;
	let submitMessage = '';
	let submitError = '';
	let tickets = [];
	let isLoadingTickets = false;

	// Image upload state
	let selectedImages = [];
	let uploadingImages = false;
	let uploadError = '';
	const MAX_IMAGES = 5;
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const MAX_TOTAL_SIZE = 30 * 1024 * 1024; // 30MB

	// Ticket detail modal state
	let showDetailModal = false;
	let selectedTicket = null;
	let loadingTicketDetail = false;

	// Validation
	let errors = {};

	// Inquiry types
	const inquiryTypes = [
		{ value: 'account', label: '계정 문의', label_en: 'Account Inquiry', label_jp: 'アカウントに関するお問い合わせ' },
		{ value: 'account_deletion', label: '계정 탈퇴', label_en: 'Account Deletion', label_jp: 'アカウント削除' },
		{ value: 'payment', label: '결제/환불', label_en: 'Payment/Refund', label_jp: '決済/払い戻し' },
		{ value: 'game_error', label: '게임 오류', label_en: 'Game Error', label_jp: 'ゲームエラー' },
		{ value: 'event', label: '이벤트 문의', label_en: 'Event Inquiry', label_jp: 'イベントに関するお問い合わせ' },
		{ value: 'other', label: '기타 문의', label_en: 'Other Inquiry', label_jp: 'その他のお問い合わせ' }
	];

	// Inquiry type templates
	const inquiryTemplates = {
		account: {
			KOR: `다음과 같은 정보를 입력하면 더 빠른 확인이 가능합니다.

- 닉네임 :
- UID :
- 문의 내용 :`,
			ENG: `Please enter the following information for faster verification:

- Nickname:
- UID:
- Detail:`,
			JPN: `次の情報をご入力いただくと、より迅速な確認が可能です。

- ニックネーム：
- UID：
- お問い合わせ内容：`
		},
		account_deletion: {
			KOR: `계정 탈퇴를 요청하기 전에 다음 사항을 확인해주세요:
⚠️ 탈퇴 시 모든 게임 데이터가 영구 삭제되며 복구할 수 없습니다.
⚠️ 보유 중인 아이템, 골드, 캐릭터 등 모든 정보가 삭제됩니다.

탈퇴를 진행하시려면 아래 정보를 입력해주세요:

- 닉네임 :
- UID :
- 탈퇴 사유 :
- 데이터 삭제 동의 여부 (동의함/동의하지 않음) :`,
			ENG: `Before requesting account deletion, please note:
⚠️ All game data will be permanently deleted and cannot be recovered.
⚠️ All items, gold, characters, and information will be deleted.

To proceed with deletion, please enter the following:

- Nickname:
- UID:
- Reason for deletion:
- Data deletion consent (I agree / I do not agree):`,
			JPN: `アカウント削除をリクエストする前に、次の点をご確認ください：
⚠️ 削除すると、すべてのゲームデータが永久に削除され、復元できません。
⚠️ 保有しているアイテム、ゴールド、キャラクターなどすべての情報が削除されます。

削除を進める場合は、以下の情報を入力してください：

- ニックネーム：
- UID：
- 削除理由：
- データ削除への同意（同意する/同意しない）：`
		},
		event: {
			KOR: `다음과 같은 정보를 입력하면 더 빠른 확인이 가능합니다.

- 닉네임 :
- Android / iOS :
- 문의 내용 :`,
			ENG: `Please enter the following information for faster verification:

- Nickname:
- Android / iOS:
- Detail:`,
			JPN: `次の情報をご入力いただくと、より迅速な確認が可能です。

- ニックネーム：
- Android / iOS：
- お問い合わせ内容：`
		},
		payment: {
			KOR: `다음과 같은 정보를 입력하면 더 빠른 확인이 가능합니다.

- 닉네임 :
- 스토어 정보 (Google Play Store/App Store) :
- 주문번호 :
- 결제 상품명 :
- 결제 금액 :`,
			ENG: `Please enter the following information for faster verification:

- Nickname:
- Store (Google Play Store/App Store):
- Order number:
- Payment Product Name:
- Payment amount:`,
			JPN: `次の情報をご入力いただくと、より迅速な確認が可能です。

- ニックネーム：
- ストア情報 (Google Play Store/App Store)：
- 注文番号：
- 決済商品名：
- 決済金額：`
		},
		game_error: {
			KOR: `다음과 같은 정보를 입력하면 더 빠른 확인이 가능합니다.

- 닉네임 :
- 단말기 모델명 및 OS 정보 :
- Android / iOS :
- 발생 일시 :
- 발생 현상 :`,
			ENG: `Please enter the following information for faster verification:

- Nickname:
- Terminal model name and OS information:
- Android / iOS:
- Date and time of occurrence:
- Content:`,
			JPN: `次の情報をご入力いただくと、より迅速な確認が可能です。

- ニックネーム：
- 端末モデル名およびOS情報：
- Android / iOS：
- 発生日時：
- 発生現象：`
		},
		other: {
			KOR: `다음과 같은 정보를 입력하면 더 빠른 확인이 가능합니다.

- 닉네임 :
- Android / iOS :
- 문의 내용 :`,
			ENG: `Please enter the following information for faster verification:

- Nickname:
- Android / iOS:
- Detail:`,
			JPN: `次の情報をご入力いただくと、より迅速な確認が可能です。

- ニックネーム：
- Android / iOS：
- お問い合わせ内容：`
		}
	};

	// Email domains
	const emailDomains = [
		'직접 입력',
		'naver.com',
		'gmail.com',
		'hotmail.com',
		'yahoo.com'
	];

	let selectedDomain = '직접 입력';
	let emailPart = '';
	let domainPart = '';

	// Real API functions
	async function submitTicketToBackend(data) {
		try {
			const response = await api.post('/support/tickets', data);
			return {
				ok: true,
				data: { ticket_number: response.data.ticket_number }
			};
		} catch (error) {
			throw new Error(error.response?.data?.detail || error.message || '서버 오류');
		}
	}

	async function loadTicketsFromBackend(userUid) {
		try {
			const response = await api.get(`/support/tickets?user_uid=${encodeURIComponent(userUid)}&page=1&page_size=50`);
			return response.data.tickets || [];
		} catch (error) {
			throw new Error(error.response?.data?.detail || error.message || '서버 오류');
		}
	}

	// Mock UID - in real app, get from authentication
	onMount(() => {
		if (browser) {
			// Unity WebView URL 파라미터 처리
			const urlParams = new URLSearchParams($page.url.searchParams);
			const uid = urlParams.get('uid');
			const locale = urlParams.get('locale');

			// Unity에서 전달된 파라미터 확인
			if (uid) {
				formData.user_uid = uid;
				isUnityWebView = true;
				localStorage.setItem('pice_user_uid', uid);
				console.log('Unity WebView detected with UID:', uid);
			} else {
				// 기본값 설정 (웹 브라우저에서 직접 접근)
				formData.user_uid = 'web_user_' + Date.now();
			}

			// 언어 설정 with fallback
			if (locale) {
				// Unity 로케일 매핑 (ko-KR -> KOR, en-US -> ENG, ja-JP -> JPN)
				if (locale.startsWith('ko') || locale.toLowerCase() === 'kor') {
					language = 'KOR';
					formData.language = 'KOR';
					console.log('Language set to: KOR from locale:', locale);
				} else if (locale.startsWith('en') || locale.toLowerCase() === 'eng') {
					language = 'ENG';
					formData.language = 'ENG';
					console.log('Language set to: ENG from locale:', locale);
				} else if (locale.startsWith('ja') || locale.toLowerCase() === 'jpn') {
					language = 'JPN';
					formData.language = 'JPN';
					console.log('Language set to: JPN from locale:', locale);
				} else {
					// Unsupported locale - fallback to English
					language = 'ENG';
					formData.language = 'ENG';
					console.log('Unsupported locale:', locale, '- Falling back to English');
				}
			} else {
				// No locale provided - default to Korean for local development
				language = 'KOR';
				formData.language = 'KOR';
			}

			loadTicketHistory();
		}
	});

	// Update email when parts change
	$: if (emailPart && domainPart) {
		formData.email = `${emailPart}@${domainPart}`;
	} else if (emailPart && selectedDomain !== '직접 입력') {
		formData.email = `${emailPart}@${selectedDomain}`;
	}

	// Save email to localStorage for audit headers
	$: if (browser && formData.email && formData.email.includes('@')) {
		localStorage.setItem('pice_user_email', formData.email);
	}

	// Update formData.language when language changes
	$: formData.language = language;

	// Track previous inquiry type for change detection
	let previousInquiryType = '';
	let originalContent = '';

	// Check if content is a template
	function isTemplateContent(content) {
		return Object.values(inquiryTemplates).some(templates =>
			templates.KOR === content || templates.ENG === content || templates.JPN === content
		);
	}

	// Handle inquiry type change with confirmation
	function handleInquiryTypeChange() {
		const newType = formData.inquiry_type;

		// If no type selected, just clear content
		if (!newType) {
			formData.content = '';
			previousInquiryType = '';
			originalContent = '';
			return;
		}

		// Check if user has made edits to content
		const hasUserEdits = formData.content &&
			formData.content !== originalContent &&
			!isTemplateContent(formData.content);

		// If user has edits and is changing type, ask for confirmation
		if (hasUserEdits && previousInquiryType && newType !== previousInquiryType) {
			const confirmMessage = language === 'KOR'
				? '문의 내용이 수정되었습니다. 문의 유형을 변경하면 템플릿이 적용되어 수정 내용이 사라집니다. 계속하시겠습니까?'
				: language === 'JPN'
				? 'お問い合わせ内容が変更されています。お問い合わせタイプを変更するとテンプレートが適用され、変更内容が消えます。続けますか？'
				: 'The inquiry content has been modified. Changing the inquiry type will apply a template and your changes will be lost. Continue?';

			if (!confirm(confirmMessage)) {
				// Revert to previous type
				formData.inquiry_type = previousInquiryType;
				return;
			}
		}

		// Apply template
		if (inquiryTemplates[newType] && inquiryTemplates[newType][language]) {
			formData.content = inquiryTemplates[newType][language];
			originalContent = formData.content;
		}

		previousInquiryType = newType;
	}

	// Auto-apply template when language changes (only if content is still a template)
	$: if (formData.inquiry_type && inquiryTemplates[formData.inquiry_type]) {
		if (isTemplateContent(formData.content) || !formData.content) {
			formData.content = inquiryTemplates[formData.inquiry_type][language] || '';
			originalContent = formData.content;
		}
	}

	// Handle domain selection
	function handleDomainChange() {
		if (selectedDomain === '직접 입력') {
			domainPart = '';
			formData.email = emailPart ? `${emailPart}@` : '';
		} else {
			domainPart = selectedDomain;
			formData.email = emailPart ? `${emailPart}@${selectedDomain}` : '';
		}
	}

	// Validate form
	function validateForm() {
		errors = {};

		if (!formData.inquiry_type) {
			errors.inquiry_type = t('error_inquiry_type');
		}

		if (!formData.email || !formData.email.includes('@')) {
			errors.email = t('error_email');
		}

		if (!formData.title || formData.title.length > 100) {
			errors.title = t('error_title');
		}

		if (!formData.content || formData.content.length > 1000) {
			errors.content = t('error_content');
		}

		if (!formData.privacy_consent) {
			errors.privacy_consent = t('error_privacy');
		}

		return Object.keys(errors).length === 0;
	}

	// Submit form
	async function submitInquiry() {
		if (!validateForm()) return;

		isSubmitting = true;
		submitError = '';
		submitMessage = '';
		uploadError = '';

		try {
			// First create the ticket
			const response = await submitTicketToBackend(formData);

			if (response.ok) {
				const result = response.data;
				const ticketNumber = result.ticket_number;

				// If there are images, upload them
				if (selectedImages.length > 0) {
					uploadingImages = true;
					try {
						// Get ticket ID from backend (need to fetch to get ID)
						const ticketsResponse = await loadTicketsFromBackend(formData.user_uid);
						const newTicket = ticketsResponse.find(t => t.ticket_number === ticketNumber);

						if (newTicket) {
							// Upload each image
							for (const image of selectedImages) {
								const uploadFormData = new FormData();
								uploadFormData.append('file', image.file);

								await api.post(
									`/support/upload-image?user_id=${encodeURIComponent(formData.user_uid)}&ticket_id=${newTicket.id}`,
									uploadFormData,
									{
										headers: {
											'Content-Type': 'multipart/form-data'
										}
									}
								);
							}
						}
					} catch (uploadErr) {
						console.error('Image upload error:', uploadErr);
						uploadError = t('image_upload_failed');
					} finally {
						uploadingImages = false;
					}
				}

				submitMessage = t('submit_success').replace('{ticket_number}', ticketNumber);

				// Reset form
				formData = {
					user_uid: formData.user_uid,
					inquiry_type: '',
					email: '',
					title: '',
					content: '',
					privacy_consent: false,
					language: formData.language
				};
				emailPart = '';
				domainPart = '';
				selectedDomain = '직접 입력';

				// Clear images
				selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
				selectedImages = [];

				// Reload ticket history
				loadTicketHistory();
			}
		} catch (error) {
			console.error('Submit ticket error:', error);
			// Better error message handling
			if (typeof error === 'string') {
				submitError = error;
			} else if (error.message) {
				submitError = error.message;
			} else if (error.detail) {
				submitError = error.detail;
			} else {
				submitError = t('submit_error');
			}
		} finally {
			isSubmitting = false;
		}
	}

	// Load ticket history
	async function loadTicketHistory() {
		if (!formData.user_uid) return;

		isLoadingTickets = true;

		try {
			// Use real backend API
			tickets = await loadTicketsFromBackend(formData.user_uid);
		} catch (error) {
			console.error('Failed to load tickets:', error);
		} finally {
			isLoadingTickets = false;
		}
	}

	// Format date (use Korean timezone)
	function formatDate(dateString) {
		return formatKoreanDate(dateString, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	// Get status label
	function getStatusLabel(status) {
		const labels = {
			KOR: {
				PENDING: '대기중',
				IN_PROGRESS: '처리중',
				ANSWERED: '답변완료',
				CLOSED: '완료'
			},
			ENG: {
				PENDING: 'Pending',
				IN_PROGRESS: 'In Progress',
				ANSWERED: 'Answered',
				CLOSED: 'Closed'
			},
			JPN: {
				PENDING: '待機中',
				IN_PROGRESS: '処理中',
				ANSWERED: '回答完了',
				CLOSED: '完了'
			}
		};
		return labels[language]?.[status?.toUpperCase()] || status;
	}

	// Get inquiry type label
	function getInquiryTypeLabel(type) {
		// Convert to uppercase for matching
		const upperType = type?.toUpperCase();
		const found = inquiryTypes.find(t => t.value?.toUpperCase() === upperType);
		if (!found) return type;
		return language === 'JPN' ? found.label_jp : language === 'ENG' ? found.label_en : found.label;
	}

	// Image upload functions
	function handleImageSelect(event) {
		const files = Array.from(event.target.files || []);
		uploadError = '';

		// Validate file count
		if (selectedImages.length + files.length > MAX_IMAGES) {
			uploadError = language === 'KOR'
				? `최대 ${MAX_IMAGES}개까지만 첨부 가능합니다.`
				: language === 'JPN'
				? `最大${MAX_IMAGES}枚まで添付可能です。`
				: `Maximum ${MAX_IMAGES} images allowed`;
			return;
		}

		// Validate each file
		for (const file of files) {
			// Check file type
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!validTypes.includes(file.type)) {
				uploadError = language === 'KOR'
					? '이미지 파일만 첨부 가능합니다 (jpg, png, gif, webp)'
					: language === 'JPN'
					? '画像ファイルのみ添付可能です (jpg, png, gif, webp)'
					: 'Only image files allowed (jpg, png, gif, webp)';
				return;
			}

			// Check file size
			if (file.size > MAX_FILE_SIZE) {
				uploadError = language === 'KOR'
					? `파일 크기는 10MB를 초과할 수 없습니다 (${file.name})`
					: language === 'JPN'
					? `ファイルサイズは10MBを超えることはできません (${file.name})`
					: `File size cannot exceed 10MB (${file.name})`;
				return;
			}
		}

		// Check total size
		const totalSize = [...selectedImages, ...files].reduce((sum, f) => sum + f.size, 0);
		if (totalSize > MAX_TOTAL_SIZE) {
			uploadError = language === 'KOR'
				? '전체 파일 크기는 30MB를 초과할 수 없습니다'
				: language === 'JPN'
				? '全体のファイルサイズは30MBを超えることはできません'
				: 'Total file size cannot exceed 30MB';
			return;
		}

		// Add files with preview URLs
		const newImages = files.map(file => ({
			file,
			preview: URL.createObjectURL(file),
			name: file.name,
			size: file.size
		}));

		selectedImages = [...selectedImages, ...newImages];
	}

	function removeImage(index) {
		// Revoke object URL to prevent memory leak
		URL.revokeObjectURL(selectedImages[index].preview);
		selectedImages = selectedImages.filter((_, i) => i !== index);
		uploadError = '';
	}

	// Ticket detail modal functions
	async function showTicketDetail(ticket) {
		selectedTicket = ticket;
		showDetailModal = true;
		loadingTicketDetail = true;

		try {
			// Load full ticket details including attachments and responses
			const response = await api.get(`/support/tickets/${ticket.id}?user_uid=${encodeURIComponent(formData.user_uid)}`);
			selectedTicket = response.data;
		} catch (error) {
			console.error('Failed to load ticket details:', error);
		} finally {
			loadingTicketDetail = false;
		}
	}

	function closeDetailModal() {
		showDetailModal = false;
		selectedTicket = null;
	}

	// Get translated text
	function t(key) {
		const translations = {
			KOR: {
				// Tab and navigation
				help_center: 'Help Center',
				inquiry_tab: '1:1 문의',
				history_tab: '내 문의 내역',
				language_name: '한국어',
				back_to_menu: '메뉴로 돌아가기',

				// Form fields
				inquiry_type: '문의 유형',
				select: '선택',
				email: '답변 이메일',
				email_placeholder: '이메일 주소',
				domain_placeholder: '도메인을 입력하세요',
				uid: 'USER ID',
				uid_auto: '(게임에서 자동 설정됨)',
				uid_placeholder: 'USER ID를 입력하세요',
				game_auto_set: '게임에서 자동으로 설정됩니다',
				title: '제목',
				title_placeholder: '제목을 입력해주세요(최대 100자)',
				content: '문의 내용',
				content_placeholder: '문의내용을 작성해주세요(최대 1,000자)',
				privacy: '개인 정보 수집 및 이용에 동의합니다.',

				// Image upload
				attach_images: '이미지 첨부',
				image_limit: '최대 5개, 각 10MB',
				select_images: '이미지 선택',
				image_upload_failed: '이미지 업로드에 실패했습니다',

				// Buttons and actions
				submit: '등록',
				submitting: '등록 중...',
				close: '닫기',

				// Messages
				no_tickets: '등록된 문의가 없습니다.',
				loading_tickets: '문의 내역을 불러오는 중...',
				loading: '로딩 중...',

				// Ticket details
				ticket_number: '티켓 번호',
				created_at: '작성일',
				inquiry_detail: '문의 상세',
				attached_images: '첨부 이미지',
				responses: '답변',
				admin: '관리자',

				// Status messages
				email_sent_message: '문의에 대한 답변은 등록하신 이메일({email})로 발송되었습니다. 메일함을 확인해주세요.',
				inquiry_received_message: '문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',

				// Misc
				required: '*',
				unity_integration: '🎮 Unity Game Integration',
				character_count: '{count}/1,000자',

				// Errors
				error_inquiry_type: '문의 유형을 선택해주세요.',
				error_email: '올바른 이메일 주소를 입력해주세요.',
				error_title: '제목을 입력해주세요 (최대 100자)',
				error_content: '문의 내용을 입력해주세요 (최대 1,000자)',
				error_privacy: '개인정보 수집 및 이용에 동의해주세요.',
				submit_success: '문의가 등록되었습니다. 티켓 번호: {ticket_number}',
				submit_error: '문의 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'
			},
			ENG: {
				// Tab and navigation
				help_center: 'Help Center',
				inquiry_tab: '1:1 Inquiry',
				history_tab: 'My Inquiries',
				language_name: 'English',
				back_to_menu: 'Back to Menu',

				// Form fields
				inquiry_type: 'Inquiry Type',
				select: 'Select',
				email: 'Reply Email',
				email_placeholder: 'Email address',
				domain_placeholder: 'Enter domain',
				uid: 'USER ID',
				uid_auto: '(Auto-set from game)',
				uid_placeholder: 'Enter USER ID',
				game_auto_set: 'Auto-set from game',
				title: 'Title',
				title_placeholder: 'Enter title (max 100 characters)',
				content: 'Content',
				content_placeholder: 'Enter inquiry content (max 1,000 characters)',
				privacy: 'I agree to the collection and use of personal information.',

				// Image upload
				attach_images: 'Attach Images',
				image_limit: 'Max 5 images, 10MB each',
				select_images: 'Select Images',
				image_upload_failed: 'Failed to upload images',

				// Buttons and actions
				submit: 'Submit',
				submitting: 'Submitting...',
				close: 'Close',

				// Messages
				no_tickets: 'No inquiries registered.',
				loading_tickets: 'Loading inquiry history...',
				loading: 'Loading...',

				// Ticket details
				ticket_number: 'Ticket Number',
				created_at: 'Created Date',
				inquiry_detail: 'Inquiry Detail',
				attached_images: 'Attached Images',
				responses: 'Responses',
				admin: 'Admin',

				// Status messages
				email_sent_message: 'The response to your inquiry has been sent to your email ({email}). Please check your mailbox.',
				inquiry_received_message: 'Your inquiry has been received. We will respond as soon as possible.',

				// Misc
				required: '*',
				unity_integration: '🎮 Unity Game Integration',
				character_count: '{count}/1,000 chars',

				// Errors
				error_inquiry_type: 'Please select inquiry type.',
				error_email: 'Please enter a valid email address.',
				error_title: 'Please enter title (max 100 characters)',
				error_content: 'Please enter content (max 1,000 characters)',
				error_privacy: 'Please agree to privacy policy.',
				submit_success: 'Inquiry submitted. Ticket Number: {ticket_number}',
				submit_error: 'Failed to submit inquiry. Please try again later.'
			},
			JPN: {
				// Tab and navigation
				help_center: 'Help Center',
				inquiry_tab: '1:1 お問い合わせ',
				history_tab: 'お問い合わせ履歴',
				language_name: '日本語',
				back_to_menu: 'メニューに戻る',

				// Form fields
				inquiry_type: 'お問い合わせタイプ',
				select: '選択',
				email: '返信メール',
				email_placeholder: 'メールアドレス',
				domain_placeholder: 'ドメインを入力してください',
				uid: 'USER ID',
				uid_auto: '(ゲームから自動設定)',
				uid_placeholder: 'USER IDを入力してください',
				game_auto_set: 'ゲームから自動設定されます',
				title: 'タイトル',
				title_placeholder: 'タイトルを入力してください（最大100文字）',
				content: 'お問い合わせ内容',
				content_placeholder: 'お問い合わせ内容を入力してください（最大1,000文字）',
				privacy: '個人情報の収集および利用に同意します。',

				// Image upload
				attach_images: '画像添付',
				image_limit: '最大5枚、各10MB',
				select_images: '画像を選択',
				image_upload_failed: '画像のアップロードに失敗しました',

				// Buttons and actions
				submit: '登録',
				submitting: '登録中...',
				close: '閉じる',

				// Messages
				no_tickets: '登録されたお問い合わせはありません。',
				loading_tickets: 'お問い合わせ履歴を読み込み中...',
				loading: '読み込み中...',

				// Ticket details
				ticket_number: 'チケット番号',
				created_at: '作成日',
				inquiry_detail: 'お問い合わせ詳細',
				attached_images: '添付画像',
				responses: '回答',
				admin: '管理者',

				// Status messages
				email_sent_message: 'お問い合わせへの回答は、ご登録いただいたメールアドレス({email})に送信されました。メールボックスをご確認ください。',
				inquiry_received_message: 'お問い合わせを受け付けました。できるだけ早くご回答いたします。',

				// Misc
				required: '*',
				unity_integration: '🎮 Unity Game Integration',
				character_count: '{count}/1,000文字',

				// Errors
				error_inquiry_type: 'お問い合わせタイプを選択してください。',
				error_email: '正しいメールアドレスを入力してください。',
				error_title: 'タイトルを入力してください（最大100文字）',
				error_content: 'お問い合わせ内容を入力してください（最大1,000文字）',
				error_privacy: '個人情報の収集および利用に同意してください。',
				submit_success: 'お問い合わせが登録されました。チケット番号: {ticket_number}',
				submit_error: 'お問い合わせの登録に失敗しました。しばらくしてから再度お試しください。'
			}
		};
		return translations[language]?.[key] || key;
	}
</script>

<svelte:head>
	<title>Help Center - Pice Console</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-3xl mx-auto px-4 py-8">
		<!-- Header with Back Button -->
		<div class="mb-6">
			<a
				href="/support{$page.url.search}"
				class="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
			>
				<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				{t('back_to_menu')}
			</a>

			<!-- Language Selector (hidden in Unity WebView) -->
			{#if !isUnityWebView}
				<div class="flex justify-end mb-4">
					<select
						bind:value={language}
						class="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
						style="background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;"
					>
						<option value="KOR">한국어</option>
						<option value="ENG">English</option>
						<option value="JPN">日本語</option>
					</select>
				</div>
			{:else}
				<div class="flex justify-end mb-4">
					<div class="text-xs text-gray-500 flex items-center space-x-1">
						<span class="w-2 h-2 bg-green-500 rounded-full"></span>
						<span>{t('language_name')}</span>
					</div>
				</div>
			{/if}
		</div>

		{#key language}
		<!-- Main Card -->
		<div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
			<!-- Tab Navigation -->
			<div class="border-b border-gray-200 mb-6">
				<div class="flex space-x-6">
					<button
						class="px-1 py-3 text-base font-medium border-b-2 transition-colors {activeTab === 'inquiry' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
						on:click={() => activeTab = 'inquiry'}
					>
						{t('inquiry_tab')}
					</button>
					<button
						class="px-1 py-3 text-base font-medium border-b-2 transition-colors {activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
						on:click={() => activeTab = 'history'}
					>
						{t('history_tab')}
					</button>
				</div>
			</div>

		<!-- 1:1 문의 Tab -->
		{#if activeTab === 'inquiry'}
			<!-- Title Section -->
			<div class="flex items-center mb-4 pb-4 border-b border-gray-200">
				<div class="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3 md:mr-4">
					<img src="/images/icon_neko.png" alt="Inquiry" class="w-8 h-8 md:w-10 md:h-10 object-contain" />
				</div>
				<div class="flex-1">
					<h2 class="text-lg md:text-xl font-bold text-gray-900">
						{t('inquiry_tab')}
					</h2>
					<p class="text-xs md:text-sm text-gray-600 mt-0.5">
						{language === 'KOR' ? '게임 관련 문의사항을 남겨주세요' : language === 'JPN' ? 'ゲーム関連のお問い合わせを送信してください' : 'Submit your game-related inquiries'}
					</p>
				</div>
			</div>

			<form on:submit|preventDefault={submitInquiry} class="space-y-6">
					<!-- 문의 유형 -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('inquiry_type')} <span class="text-red-500">{t('required')}</span>
						</label>
						<select
							bind:value={formData.inquiry_type}
							on:change={handleInquiryTypeChange}
							class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
							class:border-red-500={errors.inquiry_type}
						>
							<option value="">{t('select')}</option>
							{#each inquiryTypes as type}
								<option value={type.value}>
									{language === 'JPN' ? type.label_jp : language === 'ENG' ? type.label_en : type.label}
								</option>
							{/each}
						</select>
						{#if errors.inquiry_type}
							<p class="mt-1 text-xs md:text-sm text-red-600">{errors.inquiry_type}</p>
						{/if}
					</div>

					<!-- 답변 이메일 -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('email')} <span class="text-red-500">{t('required')}</span>
						</label>
						<div class="flex space-x-1 md:space-x-2">
							<input
								type="text"
								bind:value={emailPart}
								placeholder={t('email_placeholder')}
								maxlength="30"
								class="min-w-0 flex-1 max-w-[110px] md:max-w-none px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
								class:border-red-500={errors.email}
							>
							<span class="flex items-center px-1 md:px-2 text-sm md:text-base text-gray-900 flex-shrink-0">@</span>
							{#if selectedDomain === '직접 입력'}
								<input
									type="text"
									bind:value={domainPart}
									placeholder={t('domain_placeholder')}
									maxlength="50"
									class="min-w-0 flex-1 max-w-[130px] md:max-w-none px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
									class:border-red-500={errors.email}
								>
							{:else}
								<div class="min-w-0 flex-1 max-w-[130px] md:max-w-none flex items-center px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">
									{selectedDomain}
								</div>
							{/if}
							<select
								bind:value={selectedDomain}
								on:change={handleDomainChange}
								class="flex-shrink-0 w-auto px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
							>
								{#each emailDomains as domain}
									<option value={domain}>{domain}</option>
								{/each}
							</select>
						</div>
						{#if errors.email}
							<p class="mt-1 text-xs md:text-sm text-red-600">{errors.email}</p>
						{/if}
					</div>

					<!-- UID -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('uid')} {#if isUnityWebView}<span class="text-xs text-green-600">{t('uid_auto')}</span>{/if}
						</label>
						<input
							type="text"
							bind:value={formData.user_uid}
							readonly={isUnityWebView}
							class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md text-gray-900 {isUnityWebView ? 'bg-green-50 border-green-300' : 'bg-gray-50'}"
							placeholder={isUnityWebView ? t('game_auto_set') : t('uid_placeholder')}
						>
					</div>

					<!-- 제목 -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('title')} <span class="text-red-500">{t('required')}</span>
						</label>
						<input
							type="text"
							bind:value={formData.title}
							placeholder={t('title_placeholder')}
							maxlength="100"
							class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
							class:border-red-500={errors.title}
						>
						{#if errors.title}
							<p class="mt-1 text-xs md:text-sm text-red-600">{errors.title}</p>
						{/if}
					</div>

					<!-- 문의 내용 -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('content')} <span class="text-red-500">{t('required')}</span>
						</label>
						<textarea
							bind:value={formData.content}
							placeholder={t('content_placeholder')}
							maxlength="1000"
							rows="4"
							class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
							class:border-red-500={errors.content}
						></textarea>
						<div class="flex justify-between mt-1">
							{#if errors.content}
								<p class="text-xs md:text-sm text-red-600">{errors.content}</p>
							{:else}
								<div></div>
							{/if}
							<p class="text-xs md:text-sm text-gray-800">{t('character_count').replace('{count}', formData.content.length)}</p>
						</div>
					</div>

					<!-- 이미지 첨부 -->
					<div>
						<label class="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
							{t('attach_images')}
							<span class="text-xs text-gray-600 font-normal ml-1">
								({t('image_limit')})
							</span>
						</label>

						<input
							type="file"
							id="image-upload"
							accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
							multiple
							on:change={handleImageSelect}
							class="hidden"
						/>

						<label
							for="image-upload"
							class="flex items-center justify-center w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-700"
						>
							<svg class="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
							</svg>
							{t('select_images')}
						</label>

						{#if uploadError}
							<p class="mt-1 text-xs md:text-sm text-red-600">{uploadError}</p>
						{/if}

						<!-- Image previews -->
						{#if selectedImages.length > 0}
							<div class="mt-2 md:mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
								{#each selectedImages as image, index}
									<div class="relative group">
										<img
											src={image.preview}
											alt={image.name}
											class="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-300"
										/>
										<button
											type="button"
											on:click={() => removeImage(index)}
											class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
											</svg>
										</button>
										<div class="mt-1 text-xs text-gray-600 truncate">
											{image.name} ({(image.size / 1024).toFixed(0)}KB)
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- 개인정보 동의 -->
					<div>
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={formData.privacy_consent}
								class="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							>
							<span class="text-xs md:text-sm text-gray-900">
								{t('privacy')}
							</span>
							<svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</label>
						{#if errors.privacy_consent}
							<p class="mt-1 text-xs md:text-sm text-red-600">{errors.privacy_consent}</p>
						{/if}
					</div>

					<!-- Submit Button -->
					<div class="text-center pt-2">
						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full md:w-auto px-8 py-3 md:px-10 md:py-3.5 text-base md:text-lg bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md hover:shadow-lg"
						>
							{isSubmitting ? t('submitting') : t('submit')}
						</button>
					</div>

					<!-- Messages -->
					{#if submitMessage}
						<div class="p-2 md:p-4 text-xs md:text-sm bg-green-100 border border-green-400 text-green-700 rounded">
							{submitMessage}
						</div>
					{/if}

					{#if submitError}
						<div class="p-2 md:p-4 text-xs md:text-sm bg-red-100 border border-red-400 text-red-700 rounded">
							{submitError}
						</div>
					{/if}
			</form>
		{/if}

		<!-- 내 문의 내역 Tab -->
		{#if activeTab === 'history'}
			<!-- Title Section -->
			<div class="flex items-center mb-4 pb-4 border-b border-gray-200">
				<div class="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3 md:mr-4">
					<svg class="w-6 h-6 md:w-7 md:h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
					</svg>
				</div>
				<div class="flex-1">
					<h2 class="text-lg md:text-xl font-bold text-gray-900">
						{t('history_tab')}
					</h2>
					<p class="text-xs md:text-sm text-gray-600 mt-0.5">
						{language === 'KOR' ? '내가 작성한 문의 내역을 확인하세요' : language === 'JPN' ? '作成したお問い合わせ履歴を確認してください' : 'View your inquiry history'}
					</p>
				</div>
			</div>

			{#if isLoadingTickets}
				<div class="p-8 text-center text-gray-600">
					<svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					{t('loading_tickets')}
				</div>
			{:else if tickets.length === 0}
				<div class="p-8 text-center text-gray-600">
					<div class="text-gray-400 text-6xl mb-4">📋</div>
					{t('no_tickets')}
				</div>
			{:else}
				<div class="space-y-3">
					{#each tickets as ticket}
						<button
							type="button"
							on:click={() => showTicketDetail(ticket)}
							class="w-full text-left p-4 md:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
						>
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<div class="flex items-center space-x-2 md:space-x-3 mb-1 md:mb-2">
											<span class="text-xs md:text-sm text-gray-800">
												{getInquiryTypeLabel(ticket.inquiry_type)}
											</span>
											<span class="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-medium rounded-full {
												ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
												ticket.status === 'answered' ? 'bg-green-100 text-green-800' :
												'bg-gray-100 text-gray-800'
											}">
												{getStatusLabel(ticket.status)}
											</span>
										</div>
										<h3 class="font-medium text-sm md:text-base text-gray-900 mb-1">
											{ticket.title}
										</h3>
										<p class="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
											{t('ticket_number')}: {ticket.ticket_number}
										</p>
										<p class="text-xs md:text-sm text-gray-800">
											{t('created_at')}: {formatDate(ticket.created_at)}
										</p>
									</div>
									<svg class="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
									</svg>
								</div>
						</button>
					{/each}
				</div>
			{/if}
		{/if}
		</div>
		{/key}

		<!-- Ticket Detail Modal -->
		{#if showDetailModal && selectedTicket}
			<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" on:click={closeDetailModal}>
				<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
					<!-- Modal Header -->
					<div class="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
						<h2 class="text-lg md:text-xl font-bold text-gray-900">
							{t('inquiry_detail')}
						</h2>
						<button
							type="button"
							on:click={closeDetailModal}
							class="p-1 hover:bg-gray-100 rounded-full transition-colors"
						>
							<svg class="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
							</svg>
						</button>
					</div>

					<!-- Modal Content -->
					<div class="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
						{#if loadingTicketDetail}
							<div class="text-center py-8">
								<div class="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
								<p class="mt-2 text-sm text-gray-600">{t('loading')}</p>
							</div>
						{:else}
							<!-- Ticket Info -->
							<div class="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
								<div class="flex items-center space-x-2">
									<span class="text-xs font-medium text-gray-600">{getInquiryTypeLabel(selectedTicket.inquiry_type)}</span>
									<span class="px-2 py-1 text-xs font-medium rounded-full {
										selectedTicket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
										selectedTicket.status === 'answered' ? 'bg-green-100 text-green-800' :
										'bg-gray-100 text-gray-800'
									}">
										{getStatusLabel(selectedTicket.status)}
									</span>
								</div>
								<p class="text-xs text-gray-600">
									{t('ticket_number')}: {selectedTicket.ticket_number}
								</p>
								<p class="text-xs text-gray-600">
									{t('created_at')}: {formatDate(selectedTicket.created_at)}
								</p>
							</div>

							<!-- Title -->
							<div>
								<h3 class="text-sm font-medium text-gray-700 mb-1">{t('title')}</h3>
								<p class="text-sm md:text-base text-gray-900">{selectedTicket.title}</p>
							</div>

							<!-- Content -->
							<div>
								<h3 class="text-sm font-medium text-gray-700 mb-1">{t('content')}</h3>
								<p class="text-sm md:text-base text-gray-900 whitespace-pre-wrap">{selectedTicket.content}</p>
							</div>

							<!-- Attachments -->
							{#if selectedTicket.attachments && selectedTicket.attachments.length > 0}
								<div>
									<h3 class="text-sm font-medium text-gray-700 mb-2">
										{t('attached_images')} ({selectedTicket.attachments.length})
									</h3>
									<div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
										{#each selectedTicket.attachments as attachment}
											<a
												href={attachment.file_url}
												target="_blank"
												rel="noopener noreferrer"
												class="block relative group"
											>
												<img
													src={attachment.file_url}
													alt={attachment.file_name}
													class="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-300 hover:border-blue-500 transition-colors"
												/>
												<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
													<svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
													</svg>
												</div>
											</a>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Responses -->
							{#if selectedTicket.responses && selectedTicket.responses.length > 0}
								<div>
									<h3 class="text-sm font-medium text-gray-700 mb-2">
										{t('responses')} ({selectedTicket.responses.length})
									</h3>
									<div class="space-y-3">
										{#each selectedTicket.responses as response}
											<div class="bg-blue-50 rounded-lg p-3 md:p-4">
												<div class="flex items-center justify-between mb-2">
													<span class="text-xs md:text-sm font-medium text-blue-900">
														{response.responded_by || t('admin')}
													</span>
													<span class="text-xs text-blue-600">
														{formatDate(response.responded_at)}
													</span>
												</div>
												<p class="text-sm md:text-base text-blue-900 whitespace-pre-wrap">
													{response.response_content}
												</p>
											</div>
										{/each}
									</div>
								</div>
							{:else if selectedTicket.status === 'answered'}
								<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
									<p class="text-xs md:text-sm text-blue-800">
										📧 {t('email_sent_message').replace('{email}', selectedTicket.email)}
									</p>
								</div>
							{:else}
								<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
									<p class="text-xs md:text-sm text-yellow-800">
										{t('inquiry_received_message')}
									</p>
								</div>
							{/if}
						{/if}
					</div>

					<!-- Modal Footer -->
					<div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-end">
						<button
							type="button"
							on:click={closeDetailModal}
							class="px-4 py-2 md:px-6 md:py-2 bg-gray-800 text-white text-sm md:text-base rounded-md hover:bg-gray-700 transition-colors"
						>
							{t('close')}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom scrollbar for textarea */
	textarea::-webkit-scrollbar {
		width: 6px;
	}

	textarea::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	textarea::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}

	textarea::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>
