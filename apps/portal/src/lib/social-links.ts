const facebookPageUrl = import.meta.env["VITE_FACEBOOK_PAGE_URL"]?.trim();

export const FACEBOOK_PAGE_URL = facebookPageUrl || "https://www.facebook.com";
