```javascript
// 默认环境变量
let mytoken = 'your-secret-token';
let BotToken = '';
let ChatID = '';
let TG = 0;
let subConverter = 'SUBAPI.cmliussss.net';
let subConfig = 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config.yaml';
let FileName = 'CF-Workers-SUB';
let subProtocol = 'https'; // 第31行
let SUBUpdateTime = '6';
let MainData = '';
let urls = [];
let guestToken = '';
const total = 100;
const timestamp = 1723680000000;

async function MD5MD5(str) {
  async function md5(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return await md5(await md5(str));
}

async function sendMessage(type, ip, UA = '') {
  if (BotToken !== '' && ChatID !== '') {
    let msg = '';
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    if (response.status == 200) {
      const ipInfo = await response.json();
      msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\nISP: ${ipInfo.isp}\n数据中心: ${ipInfo.org}</tg-spoiler>`;
    } else {
      msg = `${type}\nIP: ${ip}\n<tg-spoiler>UA: ${UA}</tg-spoiler>`;
    }
    return await fetch(`https://api.telegram.org/bot${BotToken}/sendMessage?chat_id=${ChatID}&text=${encodeURIComponent(msg)}&parse_mode=HTML`);
  }
}

async function ADD(input) {
  let links = [];
  if (input.trim() === '') {
    return links;
  }
  input = input.replace(/ /g, '').replace(/\r/g, '');
  let linksArray = input.split('\n');
  for (let link of linksArray) {
    if (link.trim() !== '') {
      links.push(link.trim());
    }
  }
  return [...new Set(links)];
}

async function proxyURL(url, req) {
  try {
    let newUrl = new URL(url);
    newUrl.pathname = req.pathname;
    newUrl.search = req.search;
    return Response.redirect(newUrl.toString(), 302);
  } catch (error) {
    return new Response('无效的URL', { status: 400 });
  }
}

async function 迁移地址列表(env, txt) {
  if (env.LINK) {
    try {
      await env.KV.put(txt, env.LINK);
    } catch (error) {
      console.error('迁移KV时发生错误:', error);
    }
  }
}

function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
}

function base64Decode(str) {
  try {
    return atob(str);
  } catch (e) {
    return str;
  }
}

async function getUrl(request, url, 追加UA, userAgentHeader) {
  const headers = new Headers(request.headers);
  headers.set('User-Agent', 追加UA);
  headers.set('Accept', '*/*');
  try {
    return await fetch(url, { headers });
  } catch (error) {
    console.error(`请求 ${url} 失败: ${error}`);
    throw error;
  }
}

async function clashFix(content) {
  try {
    content = content.replace(/ {2,}/g, ' ').replace(/\t/g, ' ').replace(/\n\s*\n/g, '\n').replace(/\r/g, '');
    let lines = content.split('\n');
    let proxyStartIndex = lines.findIndex(line => line.trim() === 'proxies:');
    if (proxyStartIndex === -1) return content;
    let newLines = lines.slice(0, proxyStartIndex + 1);
    let proxies = [];
    for (let i = proxyStartIndex + 1; i < lines.length; i++) {
      if (!lines[i].startsWith('  -')) break;
      try {
        let proxy = JSON.parse(lines[i].replace('  - ', ''));
        if (!proxy['ws-opts']?.headers?.Host && !proxy['grpc-opts']) {
          proxies.push(lines[i]);
        }
      } catch (e) {
        console.error(`解析代理配置失败: ${lines[i]}, 错误: ${e}`);
      }
    }
    newLines.push(...proxies);
    return newLines.join('\n');
  } catch (e) {
    console.error(`处理 Clash 配置失败: ${e}`);
    return content;
  }
}

async function getSUB(api, request, 追加UA, userAgentHeader, filter) {
  if (!api || api.length === 0) {
    return [[], ""];
  }
  api = [...new Set(api)];
  let newapi = "";
  let 订阅转换URLs = "";
  let 异常订阅 = "";
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 2000);

  try {
    const responses = await Promise.allSettled(
      api.map(apiUrl =>
        getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response =>
          response.ok ? response.text() : Promise.reject(response)
        )
      )
    );

    const modifiedResponses = responses.map((response, index) => {
      if (response.status === 'rejected') {
        const reason = response.reason;
        if (reason && reason.name === 'AbortError') {
          return { status: '超时', value: null, apiUrl: api[index] };
        }
        console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
        return { status: '请求失败', value: null, apiUrl: api[index] };
      }
      return { status: response.status, value: response.value, apiUrl: api[index] };
    });

    console.log(modifiedResponses);

    for (const response of modifiedResponses) {
      if (response.status === 'fulfilled') {
        const content = await response.value || 'null';
        if (content.includes('proxies:')) {
          订阅转换URLs += "|" + response.apiUrl;
        } else if (content.includes('outbounds"') && content.includes('inbounds"')) {
          订阅转换URLs += "|" + response.apiUrl;
        } else if (content.includes('://')) {
          let filteredContent = content;
          if (filter) {
            filteredContent = filterNoExpire(content, filter);
          }
          newapi += filteredContent + '\n';
        } else if (isValidBase64(content)) {
          let decodedContent = base64Decode(content);
          if (filter) {
            decodedContent = filterNoExpire(decodedContent, filter);
          }
          newapi += decodedContent + '\n';
        } else {
          const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
          console.log('异常订阅: ' + 异常订阅LINK);
          异常订阅 += `${异常订阅LINK}\n`;
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    clearTimeout(timeout);
  }

  const 订阅内容 = await ADD(newapi + 异常订阅);
  return [订阅内容, 订阅转换URLs];
}

function filterNoExpire(content, filter = 'noexpire') {
  const currentTime = Math.floor(Date.now() / 1000);
  const lines = content.split('\n').filter(line => line.trim());
  return lines
    .filter(line => {
      if (!line.includes('://')) return true;
      if (filter === 'noexpire' && line.includes('expire=')) {
        const params = new URLSearchParams(line.split('?')[1]?.split('#')[0]);
        const expireTime = parseInt(params.get('expire'), 10);
        if (expireTime && expireTime < currentTime) {
          console.log(`过滤已过期节点: ${line}`);
          return false;
        }
        const [protocol, rest] = line.split('?');
        const [beforeParams, name] = rest.split('#');
        const newParams = new URLSearchParams(beforeParams);
        newParams.delete('expire');
        return `${protocol}?${newParams.toString()}${name ? '#' + name : ''}`;
      } else if (filter.startsWith('protocol:')) {
        const protocol = filter.split(':')[1];
        return line.startsWith(`${protocol}://`);
      } else if (filter.startsWith('country:')) {
        const country = filter.split(':')[1];
        return line.includes(`#${country}`);
      } else if (filter.startsWith('keyword:')) {
        const keyword = filter.split(':')[1];
        return line.toLowerCase().includes(keyword.toLowerCase());
      }
      return true;
    })
    .join('\n');
}

async function handleApiNodes(request, env, filter) {
  if (!env.KV) {
    return new Response(JSON.stringify({ error: 'KV namespace not bound' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csrfToken = request.headers.get('X-CSRF-Token');
  if (request.method === 'POST' && !csrfToken) {
    return new Response(JSON.stringify({ error: 'CSRF token required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cacheKey = `nodes_${filter || 'none'}`;
  const method = request.method;
  if (method === 'GET') {
    const cached = await env.KV.get(cacheKey);
    if (cached) {
      return new Response(cached, { headers: { 'Content-Type': 'application/json' } });
    }
    let content = await env.KV.get('LINK.txt') || MainData;
    if (filter) {
      content = filterNoExpire(content, filter);
    }
    const nodes = content.split('\n').filter(line => line.trim() && line.includes('://'));
    const response = JSON.stringify({ nodes });
    await env.KV.put(cacheKey, response, { expirationTtl: 3600 });
    return new Response(response, { headers: { 'Content-Type': 'application/json' } });
  } else if (method === 'POST') {
    try {
      const content = await request.text();
      await env.KV.put('LINK.txt', content);
      await env.KV.delete(cacheKey); // 清除缓存
      return new Response(JSON.stringify({ message: 'Nodes updated successfully' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Failed to update nodes: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleApiConfig(request, env) {
  if (!env.KV) {
    return new Response(JSON.stringify({ error: 'KV namespace not bound' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csrfToken = request.headers.get('X-CSRF-Token');
  if (request.method === 'POST' && !csrfToken) {
    return new Response(JSON.stringify({ error: 'CSRF token required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const method = request.method;
  if (method === 'GET') {
    const config = {
      SUBAPI: env.SUBAPI || subConverter,
      SUBCONFIG: env.SUBCONFIG || subConfig,
      SUBNAME: env.SUBNAME || FileName,
      SUBUPTIME: env.SUBUPTIME || SUBUpdateTime,
      TG: env.TG || TG,
      TGTOKEN: env.TGTOKEN || BotToken,
      TGID: env.TGID || ChatID,
      GUESTTOKEN: env.GUESTTOKEN || guestToken,
    };
    return new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'POST') {
    try {
      const config = await request.json();
      // 验证 SUBAPI 格式
      if (config.SUBAPI && !config.SUBAPI.startsWith('https://') && !config.SUBAPI.startsWith('http://')) {
        config.SUBAPI = 'https://' + config.SUBAPI;
      }
      await env.KV.put('CONFIG.json', JSON.stringify(config));
      return new Response(JSON.stringify({ message: 'Config updated successfully' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Failed to update config: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function KV(request, env, txt = 'LINK.txt', guest) {
  const url = new URL(request.url);
  try {
    if (request.method === "POST" && url.pathname.endsWith('/save')) {
      if (!env.KV) return new Response(JSON.stringify({ error: 'KV namespace not bound' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
      try {
        const content = await request.text();
        await env.KV.put(txt, content);
        return new Response(JSON.stringify({ message: 'Saved successfully' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: `Save failed: ${error.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method === "POST" && url.pathname.endsWith('/config')) {
      return await handleApiConfig(request, env);
    }

    let content = '';
    let hasKV = !!env.KV;
    if (hasKV) {
      try {
        content = await env.KV.get(txt) || MainData;
      } catch (error) {
        console.error('读取KV时发生错误:', error);
        content = '读取数据时发生错误: ' + error.message;
      }
    }

    let config = {};
    if (hasKV) {
      try {
        const configData = await env.KV.get('CONFIG.json');
        config = configData ? JSON.parse(configData) : {};
      } catch (error) {
        console.error('读取配置时发生错误:', error);
      }
    }

    // 生成 CSRF Token
    const csrfToken = await MD5MD5(`${mytoken}${Date.now()}`);

    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <title>${FileName} 订阅管理</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 1200px;
            }
            .section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin-bottom: 20px;
            }
            .node-table {
              margin-bottom: 15px;
            }
            .qrcode {
              margin: 10px 0;
            }
            .status {
              color: #666;
              margin-top: 10px;
            }
            textarea {
              min-height: 150px;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </head>
        <body>
          <div class="container">
            <h1 class="mb-4">${FileName} 订阅管理</h1>
            
            <div class="section">
              <h2>订阅链接</h2>
              <div class="row row-cols-1 row-cols-md-3 g-3 mb-3">
                <div class="col">
                  <strong>自适应订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')">https://${url.hostname}/${mytoken}</a>
                  <div id="qrcode_0" class="qrcode"></div>
                </div>
                <div class="col">
                  <strong>Base64订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')">https://${url.hostname}/${mytoken}?b64</a>
                  <div id="qrcode_1" class="qrcode"></div>
                </div>
                <div class="col">
                  <strong>Clash订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')">https://${url.hostname}/${mytoken}?clash</a>
                  <div id="qrcode_2" class="qrcode"></div>
                </div>
                <div class="col">
                  <strong>Singbox订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')">https://${url.hostname}/${mytoken}?sb</a>
                  <div id="qrcode_3" class="qrcode"></div>
                </div>
                <div class="col">
                  <strong>Surge订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')">https://${url.hostname}/${mytoken}?surge</a>
                  <div id="qrcode_4" class="qrcode"></div>
                </div>
                <div class="col">
                  <strong>Loon订阅:</strong>
                  <a href="#" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')">https://${url.hostname}/${mytoken}?loon</a>
                  <div id="qrcode_5" class="qrcode"></div>
                </div>
              </div>
              <div>
                <a href="#" id="guestToggle" onclick="toggleGuest()" class="text-primary">查看访客订阅 <i class="bi bi-chevron-down"></i></a>
                <div id="guestContent" style="display: none;">
                  <p class="text-muted">访客订阅只能使用订阅功能，无法查看配置页！</p>
                  <p><strong>GUEST（访客订阅TOKEN）:</strong> ${guest}</p>
                  <div class="row row-cols-1 row-cols-md-3 g-3">
                    <div class="col">
                      <strong>自适应订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')">https://${url.hostname}/sub?token=${guest}</a>
                      <div id="guest_0" class="qrcode"></div>
                    </div>
                    <div class="col">
                      <strong>Base64订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')">https://${url.hostname}/sub?token=${guest}&b64</a>
                      <div id="guest_1" class="qrcode"></div>
                    </div>
                    <div class="col">
                      <strong>Clash订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')">https://${url.hostname}/sub?token=${guest}&clash</a>
                      <div id="guest_2" class="qrcode"></div>
                    </div>
                    <div class="col">
                      <strong>Singbox订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','guest_3')">https://${url.hostname}/sub?token=${guest}&sb</a>
                      <div id="guest_3" class="qrcode"></div>
                    </div>
                    <div class="col">
                      <strong>Surge订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&surge','guest_4')">https://${url.hostname}/sub?token=${guest}&surge</a>
                      <div id="guest_4" class="qrcode"></div>
                    </div>
                    <div class="col">
                      <strong>Loon订阅:</strong>
                      <a href="#" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&loon','guest_5')">https://${url.hostname}/sub?token=${guest}&loon</a>
                      <div id="guest_5" class="qrcode"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>筛选节点</h2>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <select id="filter" class="form-select w-auto" onchange="loadNodes()">
                  <option value="">无筛选</option>
                  <option value="noexpire">去掉到期时间</option>
                  <option value="protocol:vless">仅 VLESS 协议</option>
                  <option value="protocol:trojan">仅 Trojan 协议</option>
                  <option value="protocol:ss">仅 Shadowsocks 协议</option>
                  <option value="country:HK">仅香港节点</option>
                  <option value="country:US">仅美国节点</option>
                </select>
                <input type="text" id="customFilter" class="form-control w-auto" placeholder="输入关键字（如 US）" oninput="loadNodes()">
                <button class="btn btn-primary" onclick="addNode()">添加节点</button>
                <button class="btn btn-success" onclick="bulkEditNodes()">批量编辑</button>
                <button class="btn btn-info" onclick="previewFilter()">预览筛选</button>
              </div>
              <div class="status" id="status"></div>
              <table class="table table-bordered node-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" id="selectAll" onclick="toggleSelectAll()"></th>
                    <th>协议</th>
                    <th>地址</th>
                    <th>端口</th>
                    <th>到期时间</th>
                    <th>名称</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="nodeList"></tbody>
              </table>
              <button class="btn btn-danger" onclick="deleteSelected()">批量删除</button>
            </div>

            <div class="section">
              <h2>订阅转换配置</h2>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <input type="text" id="SUBAPI" class="form-control" placeholder="订阅转换后端" value="${config.SUBAPI || subConverter}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="SUBCONFIG" class="form-control" placeholder="订阅转换配置文件" value="${config.SUBCONFIG || subConfig}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="SUBNAME" class="form-control" placeholder="订阅文件名" value="${config.SUBNAME || FileName}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="SUBUPTIME" class="form-control" placeholder="订阅更新间隔（小时）" value="${config.SUBUPTIME || SUBUpdateTime}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="TGTOKEN" class="form-control" placeholder="Telegram 机器人 Token" value="${config.TGTOKEN || BotToken}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="TGID" class="form-control" placeholder="Telegram Chat ID" value="${config.TGID || ChatID}">
                </div>
                <div class="col-md-6">
                  <input type="text" id="GUESTTOKEN" class="form-control" placeholder="访客 Token" value="${config.GUESTTOKEN || guest}">
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input type="checkbox" id="TG" class="form-check-input" ${config.TG == 1 ? 'checked' : ''}>
                    <label class="form-check-label">启用 Telegram 通知</label>
                  </div>
                </div>
                <div class="col-12">
                  <button class="btn btn-success" onclick="saveConfig()">保存配置</button>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>批量编辑节点</h2>
              <textarea id="bulkNodes" class="form-control mb-3">${content}</textarea>
              <button class="btn btn-success" onclick="saveBulkNodes()">保存节点</button>
            </div>

            <script>
              const csrfToken = '${csrfToken}';
              function copyToClipboard(text, qrcodeId) {
                navigator.clipboard.writeText(text).then(() => {
                  alert('已复制到剪贴板');
                }).catch(err => {
                  console.error('复制失败:', err);
                });
                const qrcodeDiv = document.getElementById(qrcodeId);
                qrcodeDiv.innerHTML = '';
                new QRCode(qrcodeDiv, {
                  text: text,
                  width: 150,
                  height: 150,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.Q,
                });
              }

              function toggleGuest() {
                const guestContent = document.getElementById('guestContent');
                const guestToggle = document.getElementById('guestToggle');
                guestContent.style.display = guestContent.style.display === 'none' ? 'block' : 'none';
                guestToggle.innerHTML = guestContent.style.display === 'none' ? 
                  '查看访客订阅 <i class="bi bi-chevron-down"></i>' : 
                  '隐藏访客订阅 <i class="bi bi-chevron-up"></i>';
              }

              async function loadNodes() {
                const filter = document.getElementById('filter').value;
                const customFilter = document.getElementById('customFilter').value;
                const filterParam = customFilter ? `keyword:${customFilter}` : filter;
                const response = await fetch('/api/nodes?token=${mytoken}' + (filterParam ? `&filter=${filterParam}` : ''), {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                const nodeList = document.getElementById('nodeList');
                nodeList.innerHTML = '';
                data.nodes.forEach((node, index) => {
                  const parts = node.split('://');
                  const protocol = parts[0];
                  const rest = parts[1].split('?');
                  const address = rest[0].split('@')[1]?.split(':')[0] || '';
                  const port = rest[0].split(':')[1]?.split('#')[0] || '';
                  const params = new URLSearchParams(rest[1]?.split('#')[0]);
                  const expire = params.get('expire') ? new Date(parseInt(params.get('expire')) * 1000).toLocaleString() : '无';
                  const name = rest[1]?.split('#')[1] || '未知';
                  const row = document.createElement('tr');
                  row.innerHTML = `
                    <td><input type="checkbox" class="node-select" data-index="${index}"></td>
                    <td>${protocol}</td>
                    <td>${address}</td>
                    <td>${port}</td>
                    <td>${expire}</td>
                    <td>${name}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" onclick="deleteNode(${index})">删除</button>
                      <button class="btn btn-sm btn-warning" onclick="editNode(${index}, '${node.replace(/'/g, "\\'")}')">编辑</button>
                    </td>
                  `;
                  nodeList.appendChild(row);
                });
                document.getElementById('status').textContent = `加载了 ${data.nodes.length} 个节点`;
                updateLinks(filterParam);
              }

              function updateLinks(filter) {
                const filterParam = filter ? `&filter=${filter}` : '';
                const links = [
                  { id: 'qrcode_0', url: 'https://${url.hostname}/${mytoken}?sub' + filterParam },
                  { id: 'qrcode_1', url: 'https://${url.hostname}/${mytoken}?b64' + filterParam },
                  { id: 'qrcode_2', url: 'https://${url.hostname}/${mytoken}?clash' + filterParam },
                  { id: 'qrcode_3', url: 'https://${url.hostname}/${mytoken}?sb' + filterParam },
                  { id: 'qrcode_4', url: 'https://${url.hostname}/${mytoken}?surge' + filterParam },
                  { id: 'qrcode_5', url: 'https://${url.hostname}/${mytoken}?loon' + filterParam },
                  { id: 'guest_0', url: 'https://${url.hostname}/sub?token=${guest}' + filterParam },
                  { id: 'guest_1', url: 'https://${url.hostname}/sub?token=${guest}&b64' + filterParam },
                  { id: 'guest_2', url: 'https://${url.hostname}/sub?token=${guest}&clash' + filterParam },
                  { id: 'guest_3', url: 'https://${url.hostname}/sub?token=${guest}&sb' + filterParam },
                  { id: 'guest_4', url: 'https://${url.hostname}/sub?token=${guest}&surge' + filterParam },
                  { id: 'guest_5', url: 'https://${url.hostname}/sub?token=${guest}&loon' + filterParam },
                ];
                links.forEach(link => {
                  const linkElement = document.querySelector(`a[onclick*="copyToClipboard('${link.url.split(filterParam)[0]}"]`);
                  if (linkElement) {
                    linkElement.setAttribute('onclick', `copyToClipboard('${link.url}','${link.id}')`);
                    const qrcodeDiv = document.getElementById(link.id);
                    qrcodeDiv.innerHTML = '';
                    new QRCode(qrcodeDiv, {
                      text: link.url,
                      width: 150,
                      height: 150,
                      colorDark: "#000000",
                      colorLight: "#ffffff",
                      correctLevel: QRCode.CorrectLevel.Q,
                    });
                  }
                });
              }

              async function addNode() {
                const node = prompt('请输入节点链接（例如 vless://...）:');
                if (!node || !node.includes('://')) {
                  alert('无效的节点链接');
                  return;
                }
                const response = await fetch('/api/nodes?token=${mytoken}', {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                const nodes = data.nodes;
                nodes.push(node);
                const newContent = nodes.join('\n');
                await fetch('/api/nodes?token=${mytoken}', {
                  method: 'POST',
                  body: newContent,
                  headers: { 
                    'Content-Type': 'text/plain',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                loadNodes();
              }

              async function editNode(index, node) {
                const newNode = prompt('编辑节点链接：', node);
                if (!newNode || !newNode.includes('://')) {
                  alert('无效的节点链接');
                  return;
                }
                const response = await fetch('/api/nodes?token=${mytoken}', {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                const nodes = data.nodes;
                nodes[index] = newNode;
                const newContent = nodes.join('\n');
                await fetch('/api/nodes?token=${mytoken}', {
                  method: 'POST',
                  body: newContent,
                  headers: { 
                    'Content-Type': 'text/plain',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                loadNodes();
              }

              async function deleteNode(index) {
                const response = await fetch('/api/nodes?token=${mytoken}', {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                const nodes = data.nodes;
                nodes.splice(index, 1);
                const newContent = nodes.join('\n');
                await fetch('/api/nodes?token=${mytoken}', {
                  method: 'POST',
                  body: newContent,
                  headers: { 
                    'Content-Type': 'text/plain',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                loadNodes();
              }

              function toggleSelectAll() {
                const selectAll = document.getElementById('selectAll');
                const checkboxes = document.querySelectorAll('.node-select');
                checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
              }

              async function deleteSelected() {
                const checkboxes = document.querySelectorAll('.node-select:checked');
                const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
                if (indices.length === 0) {
                  alert('请至少选择一个节点');
                  return;
                }
                const response = await fetch('/api/nodes?token=${mytoken}', {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                const nodes = data.nodes.filter((_, i) => !indices.includes(i));
                const newContent = nodes.join('\n');
                await fetch('/api/nodes?token=${mytoken}', {
                  method: 'POST',
                  body: newContent,
                  headers: { 
                    'Content-Type': 'text/plain',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                loadNodes();
              }

              async function previewFilter() {
                const filter = document.getElementById('filter').value;
                const customFilter = document.getElementById('customFilter').value;
                const filterParam = customFilter ? `keyword:${customFilter}` : filter;
                const response = await fetch('/api/nodes?token=${mytoken}' + (filterParam ? `&filter=${filterParam}` : ''), {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `预览错误: ${data.error}`;
                  return;
                }
                document.getElementById('status').textContent = `预览：加载了 ${data.nodes.length} 个节点`;
                const nodeList = document.getElementById('nodeList');
                nodeList.innerHTML = '';
                data.nodes.forEach((node, index) => {
                  const parts = node.split('://');
                  const protocol = parts[0];
                  const rest = parts[1].split('?');
                  const address = rest[0].split('@')[1]?.split(':')[0] || '';
                  const port = rest[0].split(':')[1]?.split('#')[0] || '';
                  const params = new URLSearchParams(rest[1]?.split('#')[0]);
                  const expire = params.get('expire') ? new Date(parseInt(params.get('expire')) * 1000).toLocaleString() : '无';
                  const name = rest[1]?.split('#')[1] || '未知';
                  const row = document.createElement('tr');
                  row.innerHTML = `
                    <td><input type="checkbox" class="node-select" data-index="${index}"></td>
                    <td>${protocol}</td>
                    <td>${address}</td>
                    <td>${port}</td>
                    <td>${expire}</td>
                    <td>${name}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" onclick="deleteNode(${index})">删除</button>
                      <button class="btn btn-sm btn-warning" onclick="editNode(${index}, '${node.replace(/'/g, "\\'")}')">编辑</button>
                    </td>
                  `;
                  nodeList.appendChild(row);
                });
              }

              async function bulkEditNodes() {
                const bulkNodes = document.getElementById('bulkNodes').value;
                if (!bulkNodes) {
                  alert('节点列表不能为空');
                  return;
                }
                await fetch('/api/nodes?token=${mytoken}', {
                  method: 'POST',
                  body: bulkNodes,
                  headers: { 
                    'Content-Type': 'text/plain',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                loadNodes();
              }

              async function saveConfig() {
                const config = {
                  SUBAPI: document.getElementById('SUBAPI').value,
                  SUBCONFIG: document.getElementById('SUBCONFIG').value,
                  SUBNAME: document.getElementById('SUBNAME').value,
                  SUBUPTIME: document.getElementById('SUBUPTIME').value,
                  TG: document.getElementById('TG').checked ? 1 : 0,
                  TGTOKEN: document.getElementById('TGTOKEN').value,
                  TGID: document.getElementById('TGID').value,
                  GUESTTOKEN: document.getElementById('GUESTTOKEN').value,
                };
                // 验证输入
                if (!config.SUBAPI || !config.SUBCONFIG) {
                  alert('订阅转换后端和配置文件不能为空');
                  return;
                }
                if (isNaN(parseInt(config.SUBUPTIME)) || parseInt(config.SUBUPTIME) <= 0) {
                  alert('订阅更新间隔必须是正整数');
                  return;
                }
                const response = await fetch('/config?token=${mytoken}', {
                  method: 'POST',
                  body: JSON.stringify(config),
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                  },
                });
                const data = await response.json();
                document.getElementById('status').textContent = data.error || '配置保存成功';
                window.location.reload();
              }

              async function loadConfig() {
                const response = await fetch('/config?token=${mytoken}', {
                  headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (data.error) {
                  document.getElementById('status').textContent = `错误: ${data.error}`;
                  return;
                }
                document.getElementById('SUBAPI').value = data.SUBAPI;
                document.getElementById('SUBCONFIG').value = data.SUBCONFIG;
                document.getElementById('SUBNAME').value = data.SUBNAME;
                document.getElementById('SUBUPTIME').value = data.SUBUPTIME;
                document.getElementById('TGTOKEN').value = data.TGTOKEN;
                document.getElementById('TGID').value = data.TGID;
                document.getElementById('GUESTTOKEN').value = data.GUESTTOKEN;
                document.getElementById('TG').checked = data.TG == 1;
              }

              document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('guestContent').style.display = 'none';
                loadNodes();
                loadConfig();
              });
            </script>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": 'application/json' },
    });
  }
}

async function nginx() {
  return `
    <html>
      <head>
        <title>403 Forbidden</title>
      </head>
      <body>
        <center><h1>403 Forbidden</h1></center>
        <hr><center>nginx</center>
      </body>
    </html>
  `;
}

export default {
  async fetch(request, env) {
    const userAgentHeader = request.headers.get('User-Agent');
    const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || url.pathname.split('/')[1];
    const filter = url.searchParams.get('filter') || '';
    mytoken = env.TOKEN || mytoken;
    BotToken = env.TGTOKEN || BotToken;
    ChatID = env.TGID || ChatID;
    TG = env.TG || TG;
    subConverter = env.SUBAPI || subConverter; // 使用环境变量或默认值
    subConfig = env.SUBCONFIG || subConfig;
    FileName = env.SUBNAME || FileName;
    SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;
    guestToken = env.GUESTTOKEN || guestToken;
    console.log(`初始化 - subProtocol: ${subProtocol}, subConverter: ${subConverter}`); // 调试日志

    // 加载 KV 中的配置
    if (env.KV) {
      try {
        const configData = await env.KV.get('CONFIG.json');
        if (configData) {
          const config = JSON.parse(configData);
          subConverter = config.SUBAPI || subConverter;
          subConfig = config.SUBCONFIG || subConfig;
          FileName = config.SUBNAME || FileName;
          SUBUpdateTime = config.SUBUPTIME || SUBUpdateTime;
          TG = config.TG || TG;
          BotToken = config.TGTOKEN || BotToken;
          ChatID = config.TGID || ChatID;
          guestToken = config.GUESTTOKEN || guestToken;
          // 强制修正 SUBAPI 格式
          if (subConverter && !subConverter.startsWith('https://') && !subConverter.startsWith('http://')) {
            subConverter = 'https://' + subConverter;
          }
          console.log(`KV config loaded - subProtocol: ${subProtocol}, subConverter: ${subConverter}`);
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const timeTemp = Math.ceil(currentDate.getTime() / 1000);
    const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
    guestToken = env.GUESTTOKEN || guestToken || await MD5MD5(mytoken);
    const 访客订阅 = guestToken;

    let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
    total = total * 1099511627776;
    let expire = Math.floor(timestamp / 1000);

    if (url.pathname === '/config') {
      if (![mytoken, fakeToken].includes(token)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return await handleApiConfig(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      if (![mytoken, fakeToken].includes(token)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.pathname === '/api/nodes') {
        return await handleApiNodes(request, env, filter);
      }
      return new Response(JSON.stringify({ error: 'Invalid API endpoint' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname === ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
      if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") {
        await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
      }
      if (env.URL302) return Response.redirect(env.URL302, 302);
      else if (env.URL) return await proxyURL(env.URL, url);
      else return new Response(await nginx(), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      });
    }

    if (env.KV) {
      await 迁移地址列表(env, 'LINK.txt');
      if (userAgent.includes('mozilla') && !url.search) {
        await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
        return await KV(request, env, 'LINK.txt', 访客订阅);
      } else {
        MainData = await env.KV.get('LINK.txt') || MainData;
      }
    } else {
      MainData = env.LINK || MainData;
      if (env.LINKSUB) urls = await ADD(env.LINKSUB);
    }

    let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
    let 自建节点 = "";
    let 订阅链接 = "";
    for (let x of 重新汇总所有链接) {
      if (x.toLowerCase().startsWith('http')) {
        订阅链接 += x + '\n';
      } else {
        自建节点 += x + '\n';
      }
    }
    MainData = 自建节点;
    urls = await ADD(订阅链接);
    await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

    let 订阅格式 = 'base64';
    if (!(userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
      if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
        订阅格式 = 'singbox';
      } else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
        订阅格式 = 'surge';
      } else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
        订阅格式 = 'quanx';
      } else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
        订阅格式 = 'loon';
      } else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
        订阅格式 = 'clash';
      }
    }

    let subConverterUrl;
    let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
    let req_data = MainData;

    let 追加UA = 'v2rayn';
    if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
    else if (url.searchParams.has('clash')) 追加UA = 'clash';
    else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
    else if (url.searchParams.has('surge')) 追加UA = 'surge';
    else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
    else if (url.searchParams.has('loon')) 追加UA = 'Loon';

    const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.());
    if (订阅链接数组.length > 0) {
      const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader, filter);
      console.log(请求订阅响应内容);
      req_data += 请求订阅响应内容[0].join('\n');
      订阅转换URL += "|" + 请求订阅响应内容[1];
    }

    if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
    const utf8Encoder = new TextEncoder();
    const encodedData = utf8Encoder.encode(req_data);
    const utf8Decoder = new TextDecoder();
    const text = utf8Decoder.decode(encodedData);

    const uniqueLines = new Set(text.split('\n'));
    let result = [...uniqueLines].join('\n');

    if (订阅格式 == 'base64' && !userAgent.includes('subconverter') && 订阅转换URL.includes('://')) {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
      try {
        const subConverterResponse = await fetch(subConverterUrl);
        if (subConverterResponse.ok) {
          const subConverterContent = await subConverterResponse.text();
          result += '\n' + atob(subConverterContent);
        }
      } catch (error) {
        console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
      }
    }

    let base64Data;
    try {
      base64Data = btoa(result);
    } catch (e) {
      function encodeBase64(data) {
        const binary = new TextEncoder().encode(data);
        let base64 = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (let i = 0; i < binary.length; i += 3) {
          const byte1 = binary[i];
          const byte2 = binary[i + 1] || 0;
          const byte3 = binary[i + 2] || 0;
          base64 += chars[byte1 >> 2];
          base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
          base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
          base64 += chars[byte3 & 63];
        }
        const padding = 3 - (binary.length % 3 || 3);
        return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
      }
      base64Data = encodeBase64(result);
    }

    const responseHeaders = {
      "content-type": "text/plain; charset=utf-8",
      "Profile-Update-Interval": `${SUBUpdateTime}`,
      "Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
    };

    if (订阅格式 == 'base64' || token == fakeToken) {
      return new Response(base64Data, { headers: responseHeaders });
    } else if (订阅格式 == 'clash') {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
    } else if (订阅格式 == 'singbox') {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
    } else if (订阅格式 == 'surge') {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
    } else if (订阅格式 == 'quanx') {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&udp=true`;
    } else if (订阅格式 == 'loon') {
      subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
    }

    try {
      const subConverterResponse = await fetch(subConverterUrl);
      if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
      let subConverterContent = await subConverterResponse.text();
      if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
      if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
      return new Response(subConverterContent, { headers: responseHeaders });
    } catch (error) {
      return new Response(base64Data, { headers: responseHeaders });
    }
  }
};
