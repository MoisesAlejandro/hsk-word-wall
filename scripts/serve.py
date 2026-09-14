#!/usr/bin/env python3
"""Local preview server for Hanzi Practice.

Serves the working tree (not the deployed site) on port 8777, to this Mac and to
any device on the same Wi-Fi. Responses carry no-store so a reload always shows
the current files.

    python3 scripts/serve.py          # then open the printed URL

Note: this is plain HTTP, so the service worker, offline mode, install-to-home-
screen and notifications do not apply. Use it for layout, stylus and interaction
checks; use a real HTTPS deploy to test PWA behaviour.
"""
import http.server
import os
import socket
import socketserver

PORT = 8777
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    print(f'Hanzi Practice preview: {ROOT}')
    print(f'  this Mac:      http://localhost:{PORT}')
    print(f'  phone/tablet:  http://{lan_ip()}:{PORT}   (same Wi-Fi)')
    print('  ctrl-C to stop')
    with Server(('0.0.0.0', PORT), Handler) as httpd:
        httpd.serve_forever()
