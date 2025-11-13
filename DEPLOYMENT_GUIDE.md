# Pice-Support Deployment Guide

## Azure Static Web App 배포 가이드

### 사전 준비

- [x] GitHub 리포지토리 생성 완료 (`Picobrix-Development/Pice-Support`)
- [ ] Azure Portal 접근 권한
- [ ] GitHub 계정 연동

---

## 방법 1: Azure Portal에서 생성 (추천)

### Step 1: Azure Portal 접속

1. https://portal.azure.com 접속
2. 검색창에 "Static Web Apps" 입력
3. **"Static Web Apps"** 선택

### Step 2: 리소스 생성

1. **+ Create** 버튼 클릭

2. **Basics 탭**:
   ```
   Subscription: (기존 구독 선택)
   Resource Group: resource-pop-up-pirate-dice (기존 RG 선택)

   Name: pice-support
   Plan type: Free
   Region: Korea Central (또는 East Asia)

   Source: GitHub
   GitHub Account: (연동 필요)
   Organization: Picobrix-Development
   Repository: Pice-Support
   Branch: main
   ```

3. **Build Details**:
   ```
   Build Presets: Custom
   App location: /
   Api location: (비워둠)
   Output location: build
   ```

4. **Review + Create** → **Create** 클릭

### Step 3: GitHub Actions 확인

- Azure가 자동으로 `.github/workflows/azure-static-web-apps-*.yml` 파일 생성
- GitHub Actions가 자동으로 빌드 및 배포 시작
- GitHub 리포지토리의 Actions 탭에서 진행 상황 확인

### Step 4: 환경 변수 설정

배포 완료 후:

1. Azure Portal에서 Pice-Support Static Web App 선택
2. 좌측 메뉴: **Configuration** 클릭
3. **Application settings** → **+ Add**

   ```
   Name: VITE_LIVE_API_URL
   Value: https://pice-console-live-api.azurewebsites.net/api/v1
   ```

4. **Save** 클릭
5. GitHub Actions 재실행하여 환경 변수 적용

### Step 5: 배포 확인

1. Azure Portal에서 **Overview** 탭 확인
2. **URL** 클릭 (예: https://pice-support-xxxx.azurestaticapps.net)
3. 페이지 접근 테스트:
   - `/support` - 고객센터 허브
   - `/inquiry` - 1:1 문의
   - `/redeem` - 쿠폰 입력

---

## 방법 2: Azure CLI (고급 사용자)

### 사전 준비

```bash
# Azure CLI 설치 확인
az --version

# 로그인
az login

# GitHub 토큰 준비 (https://github.com/settings/tokens)
# 권한: repo, workflow
```

### Static Web App 생성

```bash
# Resource Group 확인
az group show --name resource-pop-up-pirate-dice

# Static Web App 생성
az staticwebapp create \
  --name pice-support \
  --resource-group resource-pop-up-pirate-dice \
  --source https://github.com/Picobrix-Development/Pice-Support \
  --location "koreacentral" \
  --branch main \
  --app-location "/" \
  --output-location "build" \
  --token <GITHUB_TOKEN>
```

### 환경 변수 설정

```bash
az staticwebapp appsettings set \
  --name pice-support \
  --resource-group resource-pop-up-pirate-dice \
  --setting-names VITE_LIVE_API_URL=https://pice-console-live-api.azurewebsites.net/api/v1
```

---

## 커스텀 도메인 설정 (선택사항)

### 도메인 추가

1. Azure Portal → Pice-Support Static Web App
2. **Custom domains** → **+ Add**
3. 도메인 입력: `support.popuppiratedice.com`
4. DNS 설정:
   ```
   Type: CNAME
   Name: support
   Value: <your-static-app>.azurestaticapps.net
   ```

5. **Validate + Configure** 클릭

---

## GitHub Actions 워크플로우

Azure가 자동 생성하는 워크플로우 파일 예시:

```yaml
# .github/workflows/azure-static-web-apps-<random-name>.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "build"
```

---

## 트러블슈팅

### 빌드 실패 시

1. GitHub Actions 로그 확인
2. 로컬에서 빌드 테스트:
   ```bash
   cd /home/vizz/Pice-Support
   npm run build
   ```

### 환경 변수 미적용 시

1. Azure Portal에서 Configuration 재확인
2. GitHub Actions 수동 재실행
3. 브라우저 캐시 삭제 후 재접속

### API 연결 실패 시

1. CORS 설정 확인 (Backend API)
2. API URL 환경 변수 확인
3. 브라우저 개발자 도구 네트워크 탭 확인

---

## 배포 후 확인 사항

- [ ] 모든 페이지 접근 가능 (/, /support, /inquiry, /redeem)
- [ ] Unity WebView 파라미터 전달 (`?uid=xxx&locale=ko-KR`)
- [ ] 쿠폰 입력 기능 작동
- [ ] 1:1 문의 제출 기능 작동
- [ ] API 연결 확인 (Live API)
- [ ] 모바일 반응형 디자인 확인

---

## 참고 문서

- Azure Static Web Apps 공식 문서: https://learn.microsoft.com/en-us/azure/static-web-apps/
- SvelteKit Adapter Static: https://kit.svelte.dev/docs/adapter-static
- GitHub Actions: https://docs.github.com/en/actions
