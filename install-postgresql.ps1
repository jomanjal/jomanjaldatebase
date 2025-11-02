# PostgreSQL 18 설치 스크립트
# 한글 경로 문제 해결을 위한 스크립트

# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "PostgreSQL 18 설치 스크립트 시작..." -ForegroundColor Cyan

# 다운로드 폴더 경로 구성
$downloadsPath = [System.IO.Path]::Combine($env:USERPROFILE, "Downloads")
$installerPath = [System.IO.Path]::Combine($downloadsPath, "postgresql-18.0-2-windows-x64.exe")

Write-Host "`n검색 경로: $installerPath" -ForegroundColor Yellow

# 파일 존재 확인
if ([System.IO.File]::Exists($installerPath)) {
    Write-Host "✅ 설치 파일을 찾았습니다!" -ForegroundColor Green
    Write-Host "파일 크기: $([math]::Round((Get-Item $installerPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "`n설치 프로그램을 실행합니다..." -ForegroundColor Yellow
    Write-Host "주의: 설치 과정에서 superuser 비밀번호를 설정해야 합니다." -ForegroundColor Yellow
    
    try {
        # 설치 프로그램 실행
        Start-Process -FilePath $installerPath -Wait -NoNewWindow
        Write-Host "`n✅ 설치가 완료되었습니다!" -ForegroundColor Green
    } catch {
        Write-Host "`n❌ 설치 중 오류가 발생했습니다: $_" -ForegroundColor Red
        
        # 대안 방법: 영어 경로로 복사 후 실행
        Write-Host "`n대안 방법: 영어 경로로 복사 후 실행을 시도합니다..." -ForegroundColor Yellow
        $tempPath = "C:\temp\postgresql-installer.exe"
        
        try {
            $tempDir = "C:\temp"
            if (![System.IO.Directory]::Exists($tempDir)) {
                [System.IO.Directory]::CreateDirectory($tempDir) | Out-Null
            }
            
            Write-Host "임시 경로로 복사 중: $tempPath" -ForegroundColor Cyan
            Copy-Item -Path $installerPath -Destination $tempPath -Force
            Write-Host "복사 완료. 설치 프로그램 실행 중..." -ForegroundColor Cyan
            Start-Process -FilePath $tempPath -Wait -NoNewWindow
            Write-Host "`n✅ 설치가 완료되었습니다!" -ForegroundColor Green
        } catch {
            Write-Host "`n❌ 대안 방법도 실패했습니다: $_" -ForegroundColor Red
            Write-Host "`n수동 설치 방법:" -ForegroundColor Yellow
            Write-Host "1. 파일 탐색기를 열고 다운로드 폴더로 이동" -ForegroundColor White
            Write-Host "2. postgresql-18.0-2-windows-x64.exe 파일을 더블클릭" -ForegroundColor White
            Write-Host "3. 또는 파일을 C:\temp 같은 영어 경로로 복사 후 실행" -ForegroundColor White
        }
    }
} else {
    Write-Host "`n❌ 설치 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "경로: $installerPath" -ForegroundColor Yellow
    Write-Host "`n다운로드 폴더에서 다음 파일을 확인하세요:" -ForegroundColor Yellow
    Write-Host "- postgresql-18.0-2-windows-x64.exe" -ForegroundColor White
    
    # 다운로드 폴더의 모든 postgresql 파일 검색
    Write-Host "`n다운로드 폴더에서 PostgreSQL 관련 파일 검색 중..." -ForegroundColor Cyan
    try {
        $files = Get-ChildItem -Path $downloadsPath -Filter "*postgresql*" -ErrorAction SilentlyContinue
        if ($files) {
            Write-Host "발견된 PostgreSQL 파일:" -ForegroundColor Green
            foreach ($file in $files) {
                Write-Host "  - $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB)" -ForegroundColor White
            }
        } else {
            Write-Host "PostgreSQL 설치 파일을 찾을 수 없습니다." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "다운로드 폴더를 확인할 수 없습니다: $_" -ForegroundColor Red
    }
}

Write-Host "`n스크립트 실행 완료." -ForegroundColor Cyan


