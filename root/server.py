#!/usr/bin/python3
import sys
import traceback
import json
import socketserver
import http.server
import http.client
import urllib.parse
from datetime import datetime

PROXY_PATH_PREFIX = '/proxy/'
NON_FORWARED_HEADERS = [
    'Content-Type',
    'Content-Length',
    'Referer',
    'Host'
]

class ThreadingHttpServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass
#

class StatusBoardRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_HEAD(self):
        if self.path.startswith(PROXY_PATH_PREFIX):
            self.__handleImproperProxyCall()
            return
        #
        super().do_HEAD()
    #
    def do_GET(self):
        if self.path.startswith(PROXY_PATH_PREFIX):
            self.__handleImproperProxyCall()
            return
        #
        super().do_GET()
    #
    def do_POST(self):
        try:
            self.__handleProxyRequest()
        #
        except Exception as ex:
            msg = traceback.format_exc()
            self.log_error(msg)
            self.send_error(500, 'Server Error', msg)
        #
    #
    
    def __handleImproperProxyCall(self):
        self.send_error(404, 'Can only POST to proxy handler.')
    #
    
    def __handleProxyRequest(self):
        ### read request ###
        rq_headers = dict(self.headers)
        rq_body_length_string = rq_headers.get('Content-Length', '0')
        rq_body_length = int(rq_body_length_string)
        rq_body_bytes = self.rfile.read(rq_body_length)
        rq_body = rq_body_bytes.decode('UTF-8')
        rq = urllib.parse.parse_qs(rq_body)
        method = rq['method'][0]
        url = rq['url'][0]
        jsonData = rq['jsonData'][0]
        headers = {}
        for k, v in rq_headers.items():
            if k in NON_FORWARED_HEADERS:
                continue
            #
            headers[k] = v
        #
        
        ### write response ###
        resp = getResponse(method, url, jsonData, headers)
        resp_status = int(resp['status'])
        resp_reason = resp['reason']
        resp_headers = dict(resp['headers'])
        resp_body = resp['body_bytes']
        
        ## headers
        self.send_response(resp_status, resp_reason)
        for k, v in resp_headers.items():
            self.send_header(k, v)
        #
        self.end_headers()
        
        ## body
        self.wfile.write(resp_body)
    #
#

def getResponse(method, url, jsonData, headers):
    parsedUrl = urllib.parse.urlparse(url)
    isSecure = parsedUrl.scheme == 'https'
    netloc = parsedUrl.netloc
    conn = http.client.HTTPSConnection(netloc) \
           if isSecure else \
           http.client.HTTPConnection(netloc)
    #
    
    path = parsedUrl.path
    data = None#json.loads(jsonData)
    
    try:
        conn.request(method, path, data, headers)
        proxy_resp = conn.getresponse()
        return {
            'version': proxy_resp.version,
            'status': proxy_resp.status,
            'reason': proxy_resp.reason,
            'headers': proxy_resp.getheaders(),
            'body_bytes': proxy_resp.read()
        }
    #
    finally:
        conn.close()
    #
#

__isTest__ = len(sys.argv) > 1 and sys.argv[1] == 'test'
__isMain__ = __name__ == '__main__'
if __isMain__ and __isTest__:
    resp = getResponse('GET', 'http://www.something.com/', '{}', {})
    print(resp)
#

if __isMain__ and not __isTest__:
    PORT = 8080
    try:
        Server = ThreadingHttpServer
        server_address = ('', PORT)
        httpd = Server(server_address, StatusBoardRequestHandler)
        print('Serving on port %s...' % (PORT))
        httpd.serve_forever()
    #
    except KeyboardInterrupt:
        print()
        print('Goodbye, Dave.')
    #
#
