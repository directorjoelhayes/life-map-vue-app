function getGoogleOAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

    const options = {
        redirect_uri: import.meta.env.VITE_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL,
        // import.meta.env.VITE_PUBLIC_SERVER_ENDPOINT,
        client_id: import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            "/auth/userinfo.email",
            "/auth/userinfo.profile",
            "/auth/youtube.readonly",
            "/auth/spreadsheets.readonly",
            "/auth/drive.photos.readonly",
            "/auth/documents",
            "/auth/docs",
            "/auth/calendar.readonly",
            "/auth/calendar.acls.readonly",
            "/auth/calendar.acls",
            "/auth/calendar",
            "/auth/drive",
            "/auth/drive.readonly",
            "/auth/drive.meet.readonly",
            "/auth/gmail.modify",
            "/auth/gmail.compose",
            "/auth/fitness.activity.write",
            "/auth/fitness.activity.read"
        ].map((url) => "https://www.googleapis.com" + url).join(" ")
    }

    console.log(options);

    const qs = new URLSearchParams(options);

    return `${rootUrl}?${qs.toString()}`
}

export default getGoogleOAuthUrl