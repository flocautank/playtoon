// swift-tools-version: 5.9
// Plugin local « PtScores » (classements Game Center) des applis Playtoon — voir apps/shared/scores.js et apps/RELEASE-GUIDE.md
import PackageDescription

let package = Package(
    name: "PlaytoonScores",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "PlaytoonScores", targets: ["PtScoresPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "PtScoresPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/PtScoresPlugin")
    ]
)
