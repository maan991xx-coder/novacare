package com.novacare.vitalx;

import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/** يفعّل TLS 1.2 في أندرويد 4.4 (مطلوب لخوادم جوجل). */
public class Tls12Factory extends SSLSocketFactory {
  private final SSLSocketFactory d;
  public Tls12Factory(SSLSocketFactory d) { this.d = d; }
  private Socket on(Socket s) { if (s instanceof SSLSocket) ((SSLSocket) s).setEnabledProtocols(new String[] { "TLSv1.2" }); return s; }
  @Override public String[] getDefaultCipherSuites() { return d.getDefaultCipherSuites(); }
  @Override public String[] getSupportedCipherSuites() { return d.getSupportedCipherSuites(); }
  @Override public Socket createSocket(Socket s, String h, int p, boolean a) throws IOException { return on(d.createSocket(s, h, p, a)); }
  @Override public Socket createSocket(String h, int p) throws IOException { return on(d.createSocket(h, p)); }
  @Override public Socket createSocket(String h, int p, InetAddress l, int lp) throws IOException { return on(d.createSocket(h, p, l, lp)); }
  @Override public Socket createSocket(InetAddress h, int p) throws IOException { return on(d.createSocket(h, p)); }
  @Override public Socket createSocket(InetAddress a, int p, InetAddress l, int lp) throws IOException { return on(d.createSocket(a, p, l, lp)); }
}
