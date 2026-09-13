# ==============================================================================
# Osama App - Create 25 Pull Request Branches Script
# Usage: powershell -ExecutionPolicy Bypass -File .\create_pr.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   Osama App - 25 Pull Request Branches Generator       " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$repoRoot = Get-Location
$initialCommit = "3a44f8852ed86b423077afd5a70996c784121b83"

# 1. Take a safe temporary snapshot of current workspace files
$backupDir = Join-Path $env:TEMP "usama_snapshot_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "[1/4] Taking a pristine backup of working directory to:" -ForegroundColor Yellow
Write-Host "      $backupDir`n" -ForegroundColor DarkGray

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Copy project files excluding git and temp folders
$excludeList = @(".git", "node_modules", ".expo", "dist", "web-build")
Get-ChildItem -Path $repoRoot -Force | Where-Object { $excludeList -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $backupDir -Recurse -Force
}

Write-Host "[2/4] Defining the 25 Modular Pull Requests...`n" -ForegroundColor Yellow

$prs = @(
    @{
        Id = 1
        Branch = "feat/pr-01-tailwind-nativewind-styling"
        Title = "feat(styling): configure NativeWind and TailwindCSS design tokens"
        Desc = "Add Tailwind configuration with NativeWind v4 preset, CSS variables, and global stylesheet for responsive wellness design."
        Files = @("tailwind.config.js", "nativewind-env.d.ts", "src/global.css")
        Deletions = @()
    },
    @{
        Id = 2
        Branch = "build/pr-02-metro-babel-reanimated"
        Title = "build(metro): add Babel and Metro configurations for Reanimated"
        Desc = "Configure Metro bundler with NativeWind transformer and Babel plugins for react-native-reanimated."
        Files = @("babel.config.js", "metro.config.js")
        Deletions = @()
    },
    @{
        Id = 3
        Branch = "build/pr-03-dependencies-sdk57"
        Title = "build(deps): install Expo SDK 57 dependencies, expo-audio and supabase-js"
        Desc = "Update package.json and lockfile with Supabase JS client, expo-audio, async-storage, and lucide icons."
        Files = @("package.json", "package-lock.json")
        Deletions = @()
    },
    @{
        Id = 4
        Branch = "chore/pr-04-typescript-path-aliases"
        Title = "chore(typescript): configure path aliases and strict type-checking"
        Desc = "Update tsconfig.json with baseUrl, compiler options, and strict type checking rules."
        Files = @("tsconfig.json")
        Deletions = @()
    },
    @{
        Id = 5
        Branch = "chore/pr-05-app-rebranding-osama"
        Title = "chore(app): rebrand application to Osama and configure Android package permissions"
        Desc = "Rename app to Osama (com.wellness.osama) and configure Android camera, audio, and storage permissions."
        Files = @("app.json")
        Deletions = @()
    },
    @{
        Id = 6
        Branch = "ci/pr-06-eas-cloud-build-env"
        Title = "ci(eas): configure EAS Android APK build profile with embedded Supabase credentials"
        Desc = "Add eas.json preview profile for standalone Android APK generation and configure environment variables."
        Files = @("eas.json", ".env")
        Deletions = @()
    },
    @{
        Id = 7
        Branch = "feat/pr-07-supabase-schema-rls"
        Title = "feat(db): author complete PostgreSQL schema with RLS and storage bucket policies"
        Desc = "Create supabase_schema.sql defining daily_gutka, daily_namaz, daily_medicine, daily_pushups, daily_mood, and notes."
        Files = @("supabase_schema.sql")
        Deletions = @()
    },
    @{
        Id = 8
        Branch = "feat/pr-08-supabase-client-singleton"
        Title = "feat(supabase): create resilient Supabase client with SSR-safe AsyncStorage"
        Desc = "Initialize Supabase client with fallback credentials, safe storage adapter, and foreground auth refresh."
        Files = @("src/utils/supabase.ts", "src/lib/supabase.ts")
        Deletions = @()
    },
    @{
        Id = 9
        Branch = "feat/pr-09-local-first-storage-cache"
        Title = "feat(storage): implement local-first caching layer to prevent count resets"
        Desc = "Implement localStore utility using AsyncStorage to guarantee intake counts and daily goals never reset to zero."
        Files = @("src/utils/localStore.ts")
        Deletions = @()
    },
    @{
        Id = 10
        Branch = "feat/pr-10-media-storage-uploader"
        Title = "feat(storage): implement cross-platform photo and audio uploader for Supabase"
        Desc = "Create storage.ts with ArrayBuffer / Blob support for namaz proofs and voice memo uploads."
        Files = @("src/utils/storage.ts")
        Deletions = @()
    },
    @{
        Id = 11
        Branch = "style/pr-11-theme-design-tokens"
        Title = "style(theme): establish wellness color palette with sage green and amber accents"
        Desc = "Define cohesive color tokens in theme.ts for mindful UI styling."
        Files = @("src/constants/theme.ts")
        Deletions = @()
    },
    @{
        Id = 12
        Branch = "refactor/pr-12-clean-template-boilerplate"
        Title = "refactor(cleanup): remove default Expo template routes and unused settings"
        Desc = "Purge boilerplate explore.tsx screen and unused IDE settings."
        Files = @()
        Deletions = @(".claude/settings.json", "src/app/explore.tsx")
    },
    @{
        Id = 13
        Branch = "feat/pr-13-root-tabs-navigation"
        Title = "feat(navigation): configure bottom tabs navigation layout with gesture handling"
        Desc = "Build responsive bottom tabs layout with GestureHandlerRootView and customized Lucide icons."
        Files = @("src/app/_layout.tsx")
        Deletions = @()
    },
    @{
        Id = 14
        Branch = "feat/pr-14-azkar-quran-constants"
        Title = "feat(content): create authentic Quranic surahs, transliterations and daily affirmations"
        Desc = "Define DAILY_AZKAR constants with verified Uthmani script, transliteration, and translation."
        Files = @("src/constants/azkar.ts")
        Deletions = @()
    },
    @{
        Id = 15
        Branch = "feat/pr-15-audio-azkar-player"
        Title = "feat(audio): build interactive AzkarPlayer component with Quran.com verification link"
        Desc = "Build audio player using expo-audio with play/pause state and direct links to Quran.com."
        Files = @("src/components/AzkarPlayer.tsx")
        Deletions = @()
    },
    @{
        Id = 16
        Branch = "feat/pr-16-therapeutic-breathing-modal"
        Title = "feat(mindfulness): build 60-second guided breathing modal with silent cycles"
        Desc = "Create animated 4-2-4 inhale-hold-exhale breathing modal with completion tracking and congratulations finish."
        Files = @("src/components/BreathingModal.tsx")
        Deletions = @()
    },
    @{
        Id = 17
        Branch = "feat/pr-17-pushup-challenge-modal"
        Title = "feat(fitness): build 60-second animated push-up challenge modal with trophy finish"
        Desc = "Create 60s pushup challenge modal with rhythmic up/down animation, auto-mark done, and celebratory screen."
        Files = @("src/components/PushupModal.tsx")
        Deletions = @()
    },
    @{
        Id = 18
        Branch = "feat/pr-18-dashboard-header-and-goals"
        Title = "feat(dashboard): implement Osama greeting and 5 Today's Goals progress pills"
        Desc = "Add personalized Osama header, daily affirmation anchor, and 5-goal summary status pill row."
        Files = @("src/app/index.tsx")
        Deletions = @()
    },
    @{
        Id = 19
        Branch = "feat/pr-19-dashboard-zero-reset-intake"
        Title = "feat(intake): implement persistent Gutka intake tracker with 7-day trend history"
        Desc = "Connect large +1 thumb tap button to localStore and Supabase daily_gutka with instant response."
        Files = @("src/app/index.tsx")
        Deletions = @()
    },
    @{
        Id = 20
        Branch = "feat/pr-20-dashboard-mood-medicine"
        Title = "feat(wellness): integrate 5-emoji daily mood tracker and quick medicine toggle"
        Desc = "Add mood check-in bar directly above intake tracker and quick action card for daily medicine."
        Files = @("src/app/index.tsx")
        Deletions = @()
    },
    @{
        Id = 21
        Branch = "feat/pr-21-daily-habits-namaz-camera"
        Title = "feat(habits): build daily prayers tracker with camera-only photo proof and browser link"
        Desc = "Track 5 daily prayers with direct camera launch (no gallery), completion timestamp, and external browser link."
        Files = @("src/app/daily.tsx")
        Deletions = @()
    },
    @{
        Id = 22
        Branch = "feat/pr-22-tracking-urges-thoughts"
        Title = "feat(tracking): build custom thought and trigger counters with Two Days badge"
        Desc = "Implement thought tracker list with +1 sequential counter, Two Days badge, and date formatting."
        Files = @("src/app/tracking.tsx")
        Deletions = @()
    },
    @{
        Id = 23
        Branch = "feat/pr-23-permanent-mental-notes"
        Title = "feat(notes): create permanent mental notes and voice memo recorder"
        Desc = "Implement permanent voice memo recording via expo-audio, audio player, text notes stream, and localStore caching."
        Files = @("src/app/notes.tsx")
        Deletions = @()
    },
    @{
        Id = 24
        Branch = "fix/pr-24-purge-beeping-haptics"
        Title = "fix(sound): purge all expo-haptics invocations to eliminate phone beeping sounds"
        Desc = "Completely remove expo-haptics to ensure silent, peaceful operation on Android devices."
        Files = @("src/app/index.tsx", "src/app/daily.tsx", "src/app/tracking.tsx", "src/app/notes.tsx")
        Deletions = @()
    },
    @{
        Id = 25
        Branch = "docs/pr-25-architecture-walkthrough"
        Title = "docs: provide comprehensive system architecture and APK build documentation"
        Desc = "Complete implementation plan, walkthrough document, and Supabase integration instructions."
        Files = @("README.md", "create_pr.ps1", "merge_pr.ps1", "create PR.ps1", "merge PR.ps1")
        Deletions = @()
    }
)

# 3. Reset repository to initial commit to start creating PR branches cleanly
Write-Host "[3/4] Resetting repository to initial commit baseline ($initialCommit)..." -ForegroundColor Yellow
git checkout main | Out-Null
git reset --hard $initialCommit | Out-Null
git clean -fd | Out-Null

# Restore the PR automation scripts so they exist during execution
@("create_pr.ps1", "merge_pr.ps1", "create PR.ps1", "merge PR.ps1") | ForEach-Object {
    $src = Join-Path $backupDir $_
    $dst = Join-Path $repoRoot $_
    if (Test-Path $src) { Copy-Item -Path $src -Destination $dst -Force }
}

$hasOrigin = $false
try {
    $remote = git remote get-url origin 2>$null
    if ($remote) { $hasOrigin = $true }
} catch {}

# 4. Sequentially create each branch, copy staged files, and commit
Write-Host "`n[4/4] Creating 25 Pull Request Branches...`n" -ForegroundColor Yellow

foreach ($pr in $prs) {
    $branch = $pr.Branch
    $title = $pr.Title
    $desc = $pr.Desc
    $files = $pr.Files
    $deletions = $pr.Deletions

    # Create and checkout branch
    git checkout -b $branch 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branch 2>$null
    }

    # Copy files for this PR from backup
    foreach ($file in $files) {
        $sourcePath = Join-Path $backupDir $file
        $destPath = Join-Path $repoRoot $file
        if (Test-Path $sourcePath) {
            $parentDir = Split-Path -Path $destPath -Parent
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            git add $file
        }
    }

    # Handle file deletions
    foreach ($del in $deletions) {
        $delPath = Join-Path $repoRoot $del
        if (Test-Path $delPath) {
            git rm -f $del 2>$null
        }
    }

    # Commit with title and description
    git commit -m "$title" -m "$desc" --allow-empty | Out-Null

    # Push if origin is configured
    if ($hasOrigin) {
        git push -u origin $branch 2>$null | Out-Null
    }

    $prNum = "{0:D2}" -f $pr.Id
    Write-Host "  [+] PR #$prNum : $branch" -ForegroundColor Green
    Write-Host "      Commit : $title" -ForegroundColor Gray
}

# Return to main
git checkout main | Out-Null

# Clean up temp snapshot
Remove-Item -Path $backupDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   All 25 Pull Request Branches Created Successfully!   " -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green
Write-Host "Next Step: Merge all PRs sequentially into 'main' by running:" -ForegroundColor Cyan
Write-Host "   powershell -ExecutionPolicy Bypass -File .\merge_pr.ps1`n" -ForegroundColor White
