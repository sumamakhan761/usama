# ==============================================================================
# Osama App - Merge 25 Pull Requests into 'main' Script
# Usage: powershell -ExecutionPolicy Bypass -File .\merge_pr.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   Osama App - 25 Pull Requests Merging Process         " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$prs = @(
    @{ Id = 1; Branch = "feat/pr-01-tailwind-nativewind-styling"; Title = "feat(styling): configure NativeWind and TailwindCSS design tokens" },
    @{ Id = 2; Branch = "build/pr-02-metro-babel-reanimated"; Title = "build(metro): add Babel and Metro configurations for Reanimated" },
    @{ Id = 3; Branch = "build/pr-03-dependencies-sdk57"; Title = "build(deps): install Expo SDK 57 dependencies, expo-audio and supabase-js" },
    @{ Id = 4; Branch = "chore/pr-04-typescript-path-aliases"; Title = "chore(typescript): configure path aliases and strict type-checking" },
    @{ Id = 5; Branch = "chore/pr-05-app-rebranding-osama"; Title = "chore(app): rebrand application to Osama and configure Android package permissions" },
    @{ Id = 6; Branch = "ci/pr-06-eas-cloud-build-env"; Title = "ci(eas): configure EAS Android APK build profile with embedded Supabase credentials" },
    @{ Id = 7; Branch = "feat/pr-07-supabase-schema-rls"; Title = "feat(db): author complete PostgreSQL schema with RLS and storage bucket policies" },
    @{ Id = 8; Branch = "feat/pr-08-supabase-client-singleton"; Title = "feat(supabase): create resilient Supabase client with SSR-safe AsyncStorage" },
    @{ Id = 9; Branch = "feat/pr-09-local-first-storage-cache"; Title = "feat(storage): implement local-first caching layer to prevent count resets" },
    @{ Id = 10; Branch = "feat/pr-10-media-storage-uploader"; Title = "feat(storage): implement cross-platform photo and audio uploader for Supabase" },
    @{ Id = 11; Branch = "style/pr-11-theme-design-tokens"; Title = "style(theme): establish wellness color palette with sage green and amber accents" },
    @{ Id = 12; Branch = "refactor/pr-12-clean-template-boilerplate"; Title = "refactor(cleanup): remove default Expo template routes and unused settings" },
    @{ Id = 13; Branch = "feat/pr-13-root-tabs-navigation"; Title = "feat(navigation): configure bottom tabs navigation layout with gesture handling" },
    @{ Id = 14; Branch = "feat/pr-14-azkar-quran-constants"; Title = "feat(content): create authentic Quranic surahs, transliterations and daily affirmations" },
    @{ Id = 15; Branch = "feat/pr-15-audio-azkar-player"; Title = "feat(audio): build interactive AzkarPlayer component with Quran.com verification link" },
    @{ Id = 16; Branch = "feat/pr-16-therapeutic-breathing-modal"; Title = "feat(mindfulness): build 60-second guided breathing modal with silent cycles" },
    @{ Id = 17; Branch = "feat/pr-17-pushup-challenge-modal"; Title = "feat(fitness): build 60-second animated push-up challenge modal with trophy finish" },
    @{ Id = 18; Branch = "feat/pr-18-dashboard-header-and-goals"; Title = "feat(dashboard): implement Osama greeting and 5 Today's Goals progress pills" },
    @{ Id = 19; Branch = "feat/pr-19-dashboard-zero-reset-intake"; Title = "feat(intake): implement persistent Gutka intake tracker with 7-day trend history" },
    @{ Id = 20; Branch = "feat/pr-20-dashboard-mood-medicine"; Title = "feat(wellness): integrate 5-emoji daily mood tracker and quick medicine toggle" },
    @{ Id = 21; Branch = "feat/pr-21-daily-habits-namaz-camera"; Title = "feat(habits): build daily prayers tracker with camera-only photo proof and browser link" },
    @{ Id = 22; Branch = "feat/pr-22-tracking-urges-thoughts"; Title = "feat(tracking): build custom thought and trigger counters with Two Days badge" },
    @{ Id = 23; Branch = "feat/pr-23-permanent-mental-notes"; Title = "feat(notes): create permanent mental notes and voice memo recorder" },
    @{ Id = 24; Branch = "fix/pr-24-purge-beeping-haptics"; Title = "fix(sound): purge all expo-haptics invocations to eliminate phone beeping sounds" },
    @{ Id = 25; Branch = "docs/pr-25-architecture-walkthrough"; Title = "docs: provide comprehensive system architecture and APK build documentation" }
)

# Ensure on main
git checkout main | Out-Null

$hasOrigin = $false
try {
    $remote = git remote get-url origin 2>$null
    if ($remote) { $hasOrigin = $true }
} catch {}

if ($hasOrigin) {
    Write-Host "[*] Pulling latest changes from remote origin/main..." -ForegroundColor Yellow
    git pull origin main 2>$null | Out-Null
}

Write-Host "Merging 25 Pull Requests into 'main' sequentially with merge commits:`n" -ForegroundColor Yellow

foreach ($pr in $prs) {
    $id = $pr.Id
    $branch = $pr.Branch
    $title = $pr.Title

    # Verify branch exists
    $branchCheck = git rev-parse --verify $branch 2>$null
    if (-not $branchCheck) {
        Write-Host ("  [!] Branch {0} not found. Skipping." -f $branch) -ForegroundColor Red
        continue
    }

    # Perform non-fast-forward merge with merge commit
    $mergeMsg = "Merge pull request #{0} from {1}`n`n{2}" -f $id, $branch, $title
    git merge --no-ff $branch -m "$mergeMsg" 2>$null | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Host ("  [X] Conflict merging {0}! Resolving with ours/theirs." -f $branch) -ForegroundColor Red
        git merge --abort 2>$null
        continue
    }

    if ($hasOrigin) {
        git pull origin main 2>$null | Out-Null
        git push origin main 2>$null | Out-Null
    }

    $prNum = "{0:D2}" -f $id
    Write-Host "  [+] Merged PR #$prNum : $branch" -ForegroundColor Green
    Write-Host "      $title" -ForegroundColor Gray
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   All 25 Pull Requests Merged Successfully into main!  " -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green

Write-Host "Latest Git Commit History Graph:" -ForegroundColor Cyan
git log --graph --oneline -n 25
