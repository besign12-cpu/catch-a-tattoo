#!/bin/bash
# Sprint 3-1 Auth Foundation 적용 스크립트
# 실행 방법: bash apply-sprint3-auth.sh

PROJECT_DIR="/Users/besign/Desktop/catchatattoo/클로드/catch-a-tattoo-sprint1/catch-a-tattoo-next14"

echo "=== Sprint 3-1 Auth Foundation 적용 시작 ==="
echo ""

# @supabase/ssr 설치 확인
echo "1. @supabase/ssr 패키지 확인 중..."
cd "$PROJECT_DIR"

if grep -q '"@supabase/ssr"' package.json; then
  echo "   ✅ @supabase/ssr 이미 설치됨"
else
  echo "   📦 @supabase/ssr 설치 중..."
  npm install @supabase/ssr
  echo "   ✅ 설치 완료"
fi

echo ""
echo "2. 빌드 확인..."
npm run build

echo ""
echo "=== 완료 ==="
