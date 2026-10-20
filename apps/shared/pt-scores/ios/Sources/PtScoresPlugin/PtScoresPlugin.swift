import Foundation
import Capacitor
import GameKit

/// Classements Game Center des applis Playtoon (Block Quarry, Synth Horde).
/// Authentification standard de GameKit, discrète : lancée au démarrage ; si iOS demande l'écran de connexion,
/// il n'est montré que quand le joueur touche « Classement » (signIn). Refus ou annulation : le jeu continue normalement.
/// Classement quotidien (récurrent, 1 jour, à partir de 00:00 UTC) : un score n'est envoyé que si l'occurrence en cours,
/// d'après les serveurs d'Apple, est bien la journée UTC du défi joué (horloge du téléphone déréglée → refusé).
@objc(PtScoresPlugin)
public class PtScoresPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "PtScoresPlugin"
    public let jsName = "PtScores"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "networkTime", returnType: CAPPluginReturnPromise)
    ]
    private var loginController: UIViewController?

    override public func load() {
        DispatchQueue.main.async {
            GKLocalPlayer.local.authenticateHandler = { [weak self] controller, _ in
                self?.loginController = controller
            }
        }
    }

    @objc func status(_ call: CAPPluginCall) {
        call.resolve(["configured": true, "signedIn": GKLocalPlayer.local.isAuthenticated])
    }

    @objc func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if !GKLocalPlayer.local.isAuthenticated, let controller = self.loginController, let host = self.bridge?.viewController {
                self.loginController = nil
                host.present(controller, animated: true)
            }
            call.resolve(["signedIn": GKLocalPlayer.local.isAuthenticated])
        }
    }

    @objc func submit(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated, let id = call.getString("id"), !id.isEmpty, let score = call.getInt("score") else {
            call.reject("unavailable")
            return
        }
        let day = call.getString("day") ?? ""
        GKLeaderboard.loadLeaderboards(IDs: [id]) { boards, error in
            guard error == nil, let board = boards?.first else {
                call.reject("leaderboard not found")
                return
            }
            if !day.isEmpty, board.type == .recurring {
                let fmt = DateFormatter()
                fmt.locale = Locale(identifier: "en_US_POSIX")
                fmt.timeZone = TimeZone(identifier: "UTC")
                fmt.dateFormat = "yyyy-MM-dd"
                guard let start = board.startDate, fmt.string(from: start) == day else {
                    call.reject("stale")
                    return
                }
            }
            board.submitScore(score, context: 0, player: GKLocalPlayer.local) { err in
                if err == nil { call.resolve() } else { call.reject("submit failed") }
            }
        }
    }

    @objc func show(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard GKLocalPlayer.local.isAuthenticated, let host = self.bridge?.viewController else {
                call.reject("unavailable")
                return
            }
            let id = call.getString("id") ?? ""
            let controller = id.isEmpty
                ? GKGameCenterViewController(state: .leaderboards)
                : GKGameCenterViewController(leaderboardID: id, playerScope: .global, timeScope: .allTime)
            controller.gameCenterDelegate = self
            host.present(controller, animated: true)
            call.resolve()
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }

    // pas d'heure réseau publique sur iOS : la vérification passe par l'occurrence du classement (submit)
    @objc func networkTime(_ call: CAPPluginCall) {
        call.resolve([:])
    }
}
