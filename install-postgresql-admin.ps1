# PostgreSQL 18 설치 스크립트 (관리자 권한 필요)
# 이 스크립트는 관리자 권한으로 실행해야 합니다.

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 관리자 권한이 필요합니다." -ForegroundColor Red
    Write-Host "`n다음 방법 중 하나를 선택하세요:" -ForegroundColor Yellow
    Write-Host "`n[방법 1] PowerShell을 관리자 권한으로 실행 후 이 스크립트 실행" -ForegroundColor Cyan
    Write-Host "  1. 시작 메뉴에서 PowerShell 검색" -ForegroundColor White
    Write-Host "  2. 'Windows PowerShell' 우클릭 -> '관리자 권한으로 실행'" -ForegroundColor White
    Write-Host "  3. 다음 명령어 실행:" -ForegroundColor White
    Write-Host "     cd '$PWD'" -ForegroundColor Green
    Write-Host "     .\install-postgresql-admin.ps1" -ForegroundColor Green
    
    Write-Host "`n[방법 2] 자동으로 관리자 권한으로 재시작" -ForegroundColor Cyan
    $response = Read-Host "지금 관리자 권한으로 재시작하시겠습니까? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "관리자 권한으로 재시작합니다..." -ForegroundColor Yellow
        $scriptPath = Join-Path $PWD "install-postgresql-admin.ps1"
        Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptPath`""
        exit
    }
    
    exit
}

# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "`n✅ 관리자 권한으로 실행 중입니다." -ForegroundColor Green
Write-Host "PostgreSQL 18 설치 스크립트 시작...`n" -ForegroundColor Cyan

# 다운로드 폴더 경로 구성
$downloadsPath = [System.IO.Path]::Combine($env:USERPROFILE, "Downloads")
$installerPath = [System.IO.Path]::Combine($downloadsPath, "postgresql-18.0-2-windows-x64.exe")

Write-Host "검색 경로: $installerPath" -ForegroundColor Yellow

# 파일 존재 확인
if ([System.IO.File]::Exists($installerPath)) {
    Write-Host "✅ 설치 파일을 찾았습니다!" -ForegroundColor Green
    Write-Host "파일 크기: $([math]::Round((Get-Item $installerPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "`n설치 프로그램을 실행합니다..." -ForegroundColor Yellow
    Write-Host "주의사항:" -ForegroundColor Yellow
    Write-Host "- 설치 경로: 기본값 사용 권장 (C:\Program Files\PostgreSQL\18)" -ForegroundColor White
    Write-Host "- 포트: 5432 (기본값)" -ForegroundColor White
    Write-Host "- Superuser 비밀번호: 기억하기 쉬운 비밀번호를 설정하세요" -ForegroundColor White
    Write-Host "- 로케일: 기본값 또는 한국어" -ForegroundColor White
    
    Write-Host "`n계속하려면 아무 키나 누르세요..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    try {
        # 설치 프로그램 실행 (관리자 권한으로)
        Write-Host "`n설치 프로그램 실행 중..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -Wait -Verb RunAs
        Write-Host "`n✅ 설치가 완료되었습니다!" -ForegroundColor Green
        Write-Host "`n다음 단계:" -ForegroundColor Cyan
        Write-Host "1. PostgreSQL이 설치되었는지 확인: Get-Service postgresql*" -ForegroundColor White
        Write-Host "2. psql 버전 확인: psql --version" -ForegroundColor White
    } catch {
        Write-Host "`n❌ 설치 중 오류가 발생했습니다: $_" -ForegroundColor Red
        Write-Host "오류 상세: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ 설치 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "경로: $installerPath" -ForegroundColor Yellow
    
    # 다운로드 폴더의 모든 postgresql 파일 검색
    Write-Host "`n다운로드 폴더에서 PostgreSQL 관련 파일 검색 중..." -ForegroundColor Cyan
    try {
        $files = Get-ChildItem -Path $downloadsPath -Filter "*postgresql*" -ErrorAction SilentlyContinue
        if ($files) {
            Write-Host "발견된 PostgreSQL 파일:" -ForegroundColor Green
            foreach ($file in $files) {
                Write-Host "  - $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB)" -ForegroundColor White
                Write-Host "    전체 경로: $($file.FullName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "PostgreSQL 설치 파일을 찾을 수 없습니다." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "다운로드 폴더를 확인할 수 없습니다: $_" -ForegroundColor Red
    }
}

Write-Host "`n스크립트 실행 완료." -ForegroundColor Cyan
Read-Host "`n계속하려면 Enter 키를 누르세요"


