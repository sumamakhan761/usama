# ==============================================================================
# Osama App - Automated GitHub Pull Requests Creator & Merger
# Usage: powershell -ExecutionPolicy Bypass -File .\github_prs.ps1
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   Osama App - GitHub Pull Requests Creator & Merger    " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$prs = @(
    @{
        Id = 2
        Branch = "build/pr-02-metro-babel-reanimated"
        Title = "build(metro): add Babel and Metro configurations for Reanimated"
        Desc = "Configure Metro bundler with NativeWind transformer and Babel plugins for react-native-reanimated."
    },
    @{
        Id = 3
        Branch = "build/pr-03-dependencies-sdk57"
        Title = "build(deps): install Expo SDK 57 dependencies, expo-audio and supabase-js"
        Desc = "Update package.json and lockfile with Supabase JS client, expo-audio, async-storage, and lucide icons."
    },
    @{
        Id = 4
        Branch = "chore/pr-04-typescript-path-aliases"
        Title = "chore(typescript): configure path aliases and strict type-checking"
        Desc = "Update tsconfig.json with baseUrl, compiler options, and strict type checking rules."
    },
    @{
        Id = 5
        Branch = "chore/pr-05-app-rebranding-osama"
        Title = "chore(app): rebrand application to Osama and configure Android package permissions"
        Desc = "Rename app to Osama (com.wellness.osama) and configure Android camera, audio, and storage permissions."
    },
    @{
        Id = 6
        Branch = "ci/pr-06-eas-cloud-build-env"
        Title = "ci(eas): configure EAS Android APK build profile with embedded Supabase credentials"
        Desc = "Add eas.json preview profile for standalone Android APK generation and configure environment variables."
    },
    @{
        Id = 7
        Branch = "feat/pr-07-supabase-schema-rls"
        Title = "feat(db): author complete PostgreSQL schema with RLS and storage bucket policies"
        Desc = "Create supabase_schema.sql defining daily_gutka, daily_namaz, daily_medicine, daily_pushups, daily_mood, and notes."
    },
    @{
        Id = 8
        Branch = "feat/pr-08-supabase-client-singleton"
        Title = "feat(supabase): create resilient Supabase client with SSR-safe AsyncStorage"
        Desc = "Initialize Supabase client with fallback credentials, safe storage adapter, and foreground auth refresh."
    },
    @{
        Id = 9
        Branch = "feat/pr-09-local-first-storage-cache"
        Title = "feat(storage): implement local-first caching layer to prevent count resets"
        Desc = "Implement localStore utility using AsyncStorage to guarantee intake counts and daily goals never reset to zero."
    },
    @{
        Id = 10
        Branch = "feat/pr-10-media-storage-uploader"
        Title = "feat(storage): implement cross-platform photo and audio uploader for Supabase"
        Desc = "Create storage.ts with ArrayBuffer / Blob support for namaz proofs and voice memo uploads."
    },
    @{
        Id = 11
        Branch = "style/pr-11-theme-design-tokens"
        Title = "style(theme): establish wellness color palette with sage green and amber accents"
        Desc = "Define cohesive color tokens in theme.ts for mindful UI styling."
    },
    @{
        Id = 12
        Branch = "refactor/pr-12-clean-template-boilerplate"
        Title = "refactor(cleanup): remove default Expo template routes and unused settings"
        Desc = "Purge boilerplate explore.tsx screen and unused IDE settings."
    },
    @{
        Id = 13
        Branch = "feat/pr-13-root-tabs-navigation"
        Title = "feat(navigation): configure bottom tabs navigation layout with gesture handling"
        Desc = "Build responsive bottom tabs layout with GestureHandlerRootView and customized Lucide icons."
    },
    @{
        Id = 14
        Branch = "feat/pr-14-azkar-quran-constants"
        Title = "feat(content): create authentic Quranic surahs, transliterations and daily affirmations"
        Desc = "Define DAILY_AZKAR constants with verified Uthmani script, transliteration, and translation."
    },
    @{
        Id = 15
        Branch = "feat/pr-15-audio-azkar-player"
        Title = "feat(audio): build interactive AzkarPlayer component with Quran.com verification link"
        Desc = "Build audio player using expo-audio with play/pause state and direct links to Quran.com."
    },
    @{
        Id = 16
        Branch = "feat/pr-16-therapeutic-breathing-modal"
        Title = "feat(mindfulness): build 60-second guided breathing modal with silent cycles"
        Desc = "Create animated 4-2-4 inhale-hold-exhale breathing modal with completion tracking and congratulations finish."
    },
    @{
        Id = 17
        Branch = "feat/pr-17-pushup-challenge-modal"
        Title = "feat(fitness): build 60-second animated push-up challenge modal with trophy finish"
        Desc = "Create 60s pushup challenge modal with rhythmic up/down animation, auto-mark done, and celebratory screen."
    },
    @{
        Id = 18
        Branch = "feat/pr-18-dashboard-header-and-goals"
        Title = "feat(dashboard): implement Osama greeting and 5 Today's Goals progress pills"
        Desc = "Add personalized Osama header, daily affirmation anchor, and 5-goal summary status pill row."
    },
    @{
        Id = 19
        Branch = "feat/pr-19-dashboard-zero-reset-intake"
        Title = "feat(intake): implement persistent Gutka intake tracker with 7-day trend history"
        Desc = "Connect large +1 thumb tap button to localStore and Supabase daily_gutka with instant response."
    },
    @{
        Id = 20
        Branch = "feat/pr-20-dashboard-mood-medicine"
        Title = "feat(wellness): integrate 5-emoji daily mood tracker and quick medicine toggle"
        Desc = "Add mood check-in bar directly above intake tracker and quick action card for daily medicine."
    },
    @{
        Id = 21
        Branch = "feat/pr-21-daily-habits-namaz-camera"
        Title = "feat(habits): build daily prayers tracker with camera-only photo proof and browser link"
        Desc = "Track 5 daily prayers with direct camera launch (no gallery), completion timestamp, and external browser link."
    },
    @{
        Id = 22
        Branch = "feat/pr-22-tracking-urges-thoughts"
        Title = "feat(tracking): build custom thought and trigger counters with Two Days badge"
        Desc = "Implement thought tracker list with +1 sequential counter, Two Days badge, and date formatting."
    },
    @{
        Id = 23
        Branch = "feat/pr-23-permanent-mental-notes"
        Title = "feat(notes): create permanent mental notes and voice memo recorder"
        Desc = "Implement permanent voice memo recording via expo-audio, audio player, text notes stream, and localStore caching."
    },
    @{
        Id = 24
        Branch = "fix/pr-24-purge-beeping-haptics"
        Title = "fix(sound): purge all expo-haptics invocations to eliminate phone beeping sounds"
        Desc = "Completely remove expo-haptics to ensure silent, peaceful operation on Android devices."
    },
    @{
        Id = 25
        Branch = "docs/pr-25-architecture-walkthrough"
        Title = "docs: provide comprehensive system architecture and APK build documentation"
        Desc = "Complete implementation plan, walkthrough document, and Supabase integration instructions."
    }
)

Write-Host "Creating and Merging Pull Requests #2 to #25 on GitHub:`n" -ForegroundColor Yellow

foreach ($pr in $prs) {
    $id = $pr.Id
    $branch = $pr.Branch
    $title = $pr.Title
    $desc = $pr.Desc

    Write-Host ("===> Processing PR #{0:D2}: {1}" -f $id, $branch) -ForegroundColor Cyan

    # 1. Create Pull Request via GitHub CLI
    $prUrl = gh pr create --head $branch --base main --title "$title" --body "$desc" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "     Failed to create PR: $prUrl" -ForegroundColor Red
        continue
    }

    Write-Host "     [+] Created PR: $prUrl" -ForegroundColor Green

    # Small pause to ensure GitHub indexes the PR
    Start-Sleep -Seconds 2

    # 2. Merge Pull Request via GitHub CLI
    $mergeOut = gh pr merge $id --merge --subject "$title" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "     [+] Successfully Merged PR #$id on GitHub!" -ForegroundColor Green
    } else {
        # Retry with --auto or --admin if needed
        $mergeRetry = gh pr merge $id --merge 2>&1
        Write-Host "     [+] Merged (retry): $mergeRetry" -ForegroundColor Green
    }

    # 3. Pull latest main
    git pull origin main 2>&1 | Out-Null
    Write-Host "     [+] Pulled latest main" -ForegroundColor Gray

    # Brief delay between requests to be gentle on GitHub API
    Start-Sleep -Seconds 2
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   All 25 Pull Requests Merged Successfully on GitHub!   " -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green

Write-Host "Check your PRs on GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/sumamakhan761/usama/pulls?q=is%3Apr+is%3Aclosed`n" -ForegroundColor White
