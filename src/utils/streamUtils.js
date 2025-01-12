export const createStreamUrl = (username, password, serverUrl) => {
  if (!username || !password || !serverUrl) {
    throw new Error('Kullanıcı adı, şifre ve sunucu adresi gereklidir');
  }

  // Sunucu URL'sini düzenle
  let baseUrl = serverUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `http://${baseUrl}`;
  }
  
  // Sonundaki slash'i temizle
  baseUrl = baseUrl.replace(/\/+$/, '');

  // IPTV stream formatları
  const formats = {
    m3u: `${baseUrl}/get.php?username=${username}&password=${password}&type=m3u_plus&output=ts`,
    m3u_plus: `${baseUrl}/xmltv.php?username=${username}&password=${password}`,
    ts: `${baseUrl}/live/${username}/${password}/`,
    mpegts: `${baseUrl}:8080/live/${username}/${password}/`
  };

  return formats.m3u;
}; 