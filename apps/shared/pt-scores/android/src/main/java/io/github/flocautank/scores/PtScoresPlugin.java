package io.github.flocautank.scores;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.leaderboard.LeaderboardVariant;
import com.google.android.gms.tasks.Task;

/**
 * Classements Google Play Jeux (Play Games Services v2) des applis Playtoon.
 * Inactif tant que le manifeste de l'appli ne déclare pas com.google.android.gms.games.APP_ID (ajouté par la CI
 * seulement si la variable PLAY_GAMES_APP_ID existe) : l'appli démarre alors exactement comme avant.
 * Connexion : automatique au lancement (Play Jeux v2) ; si elle n'a pas eu lieu, signIn() à la demande du joueur.
 * Aucune méthode ne lève d'exception vers le jeu : tout échec devient « indisponible » ou un rejet silencieux.
 */
@CapacitorPlugin(name = "PtScores")
public class PtScoresPlugin extends Plugin {
    private boolean configured = false;

    @Override
    public void load() {
        try {
            ApplicationInfo ai = getContext().getPackageManager().getApplicationInfo(getContext().getPackageName(), PackageManager.GET_META_DATA);
            configured = ai.metaData != null && ai.metaData.containsKey("com.google.android.gms.games.APP_ID");
        } catch (Exception e) {
            configured = false;
        }
        if (configured) {
            try {
                PlayGamesSdk.initialize(getContext());
            } catch (Exception e) {
                configured = false;
            }
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        r.put("configured", configured);
        r.put("signedIn", false);
        if (!configured || getActivity() == null) {
            call.resolve(r);
            return;
        }
        try {
            PlayGames.getGamesSignInClient(getActivity()).isAuthenticated().addOnCompleteListener(t -> {
                r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
                call.resolve(r);
            });
        } catch (Exception e) {
            call.resolve(r);
        }
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        JSObject r = new JSObject();
        r.put("signedIn", false);
        if (!configured || getActivity() == null) {
            call.resolve(r);
            return;
        }
        try {
            PlayGames.getGamesSignInClient(getActivity()).signIn().addOnCompleteListener(t -> {
                r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
                call.resolve(r);
            });
        } catch (Exception e) {
            call.resolve(r);
        }
    }

    @PluginMethod
    public void submit(PluginCall call) {
        String id = call.getString("id");
        Double score = call.getDouble("score");
        if (!configured || getActivity() == null || id == null || id.isEmpty() || score == null) {
            call.reject("unavailable");
            return;
        }
        try {
            PlayGames.getLeaderboardsClient(getActivity()).submitScoreImmediate(id, score.longValue()).addOnCompleteListener(t -> {
                if (t.isSuccessful()) call.resolve();
                else call.reject("submit failed");
            });
        } catch (Exception e) {
            call.reject("submit failed");
        }
    }

    @PluginMethod
    public void show(PluginCall call) {
        if (!configured || getActivity() == null) {
            call.reject("unavailable");
            return;
        }
        try {
            String id = call.getString("id");
            boolean daily = Boolean.TRUE.equals(call.getBoolean("daily", false));
            LeaderboardsClient c = PlayGames.getLeaderboardsClient(getActivity());
            Task<Intent> t = id == null || id.isEmpty()
                ? c.getAllLeaderboardsIntent()
                : c.getLeaderboardIntent(id, daily ? LeaderboardVariant.TIME_SPAN_DAILY : LeaderboardVariant.TIME_SPAN_ALL_TIME);
            t.addOnCompleteListener(task -> {
                if (task.isSuccessful() && task.getResult() != null) startActivityForResult(call, task.getResult(), "shown");
                else call.reject("show failed");
            });
        } catch (Exception e) {
            call.reject("show failed");
        }
    }

    @ActivityCallback
    private void shown(PluginCall call, ActivityResult result) {
        if (call != null) call.resolve();
    }

    // heure réseau du système (Android 13+), pour refuser un défi du jour joué avec une horloge déréglée
    @PluginMethod
    public void networkTime(PluginCall call) {
        JSObject r = new JSObject();
        if (Build.VERSION.SDK_INT >= 33) {
            try {
                r.put("ms", SystemClock.currentNetworkTimeClock().millis());
            } catch (Exception e) {
                // pas d'heure réseau connue : on ne bloque rien
            }
        }
        call.resolve(r);
    }
}
