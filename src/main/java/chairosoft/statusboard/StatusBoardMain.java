package chairosoft.statusboard;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.HandlerContainer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.util.MultiMap;
import org.eclipse.jetty.util.UrlEncoded;
import org.eclipse.jetty.util.log.Log;

import org.json.JSONObject;

public class StatusBoardMain {
    
    ////// Constants //////
    public static final int PORT = 8080;
    public static final String DEFAULT_TEST_URL_STRING = "http://www.something.com/";
    public static final String RESOURCE_DIRECTORY_ROOT = System.getProperty("chairosoft.resource.directory.root", "./root");
    public static final String PROXY_PATH_PREFIX = "/proxy/";
    public static final List<String> NON_FORWARDED_HEADERS = Arrays.asList(
        "Content-Type",
        "Content-Length",
        "Referer",
        "Host",
        "X-Requested-With",
        "Cookie",
        "Connection"
    );
    
    
    ////// Main Method //////
    public static void main(String[] args) throws Exception {
        if (args.length > 0 && "test".equalsIgnoreCase(args[0])) {
            String urlString = args.length > 1 ? args[1] : DEFAULT_TEST_URL_STRING;
            long startMs = System.currentTimeMillis();
            ProxyResponse resp = getProxyResponse("GET", urlString, null, null);
            long endMs = System.currentTimeMillis();
            System.out.println(resp);
            System.out.println("response time ms = " + (endMs - startMs));
        }
        else {
            File rootFile = new File(RESOURCE_DIRECTORY_ROOT);
            String rootPath = rootFile.getCanonicalPath();
            StatusBoardServer server = new StatusBoardServer(PORT);
            System.out.println("Serving on port " + PORT + "...");
            System.out.println("Serving resources from " + rootPath);
            server.start();
            server.join();
        }
    }
    
    
    ////// Static Inner Classes //////
    public static class StatusBoardServer extends Server {
        //// Constructor ////
        public StatusBoardServer(int port) {
            super(port);
            
            // Create Root
            ContextHandlerCollection rootHandler = new ContextHandlerCollection();
            List<Handler> subHandlers = new ArrayList<>();
            
            // Files Handler
            ContextHandler resourceContext = new ContextHandler(rootHandler, "/");
            ResourceHandler resourceHandler = new ResourceHandler();
            resourceHandler.setDirectoriesListed(true);
            resourceHandler.setWelcomeFiles(new String[] {"index.html"});
            resourceHandler.setMinMemoryMappedContentLength(-1);
            resourceHandler.setResourceBase(RESOURCE_DIRECTORY_ROOT);
            resourceContext.setHandler(resourceHandler);
            resourceContext.setLogger(Log.getLogger(ResourceHandler.class));
            subHandlers.add(resourceContext);
            
            // Proxy Handler
            ContextHandler proxyContext = new ContextHandler(rootHandler, PROXY_PATH_PREFIX);
            ProxyHandler proxyHandler = new ProxyHandler();
            proxyContext.setHandler(proxyHandler);
            proxyContext.setLogger(Log.getLogger(ProxyHandler.class));
            subHandlers.add(proxyContext);
            
            // Default Handler
            subHandlers.add(new DefaultHandler());
            
            // Set Root
            rootHandler.setHandlers(subHandlers.toArray(new Handler[0]));
            this.setHandler(rootHandler);
        }
    }
    
    public static class ProxyResponse {
        //// Instance Fields ////
        public int statusCode = -1;
        public String reason = null;
        public Map<String,List<String>> headers = null;
        public byte[] bodyBytes = null;
        
        //// Constructor ////
        public ProxyResponse() { }
        
        //// Instance Methods ////
        @Override public String toString() {
            return String.format(
                "Response[\n %s %s \n %s \n %s \n]",
                this.statusCode,
                this.reason,
                this.headers,
                new String(this.bodyBytes)
            );
        }
    }
    
    public static class LiberatedBAOS extends ByteArrayOutputStream {
        //// Constructor ////
        public LiberatedBAOS() { super(); }
        
        //// Instance Methods ////
        public byte[] getBuffer() { return this.buf; }
        public void writeAll(InputStream in, int bufferSize) 
            throws IOException 
        {
            byte[] buffer = new byte[bufferSize];
            int bytesRead;
            while (0 < (bytesRead = in.read(buffer))) {
                this.write(buffer, 0, bytesRead);
            }
        }
    }
    
    public static class ProxyHandler extends AbstractHandler {
        //// Constructor ////
        public ProxyHandler() { super(); }
        
        //// Instance Methods ////
        @Override public void handle(
            String target,
            Request baseRequest,
            HttpServletRequest request,
            HttpServletResponse response
        ) throws IOException, ServletException
        {
            // read request
            MultiMap<String> rqHeaders = getRequestHeaders(request);
            MultiMap<String> rqBody = getProxyRequestBody(request);
            String method = rqBody.getValue("method", 0);
            String urlString = rqBody.getValue("url", 0);
            String jsonData = rqBody.getValue("jsonData", 0);
            MultiMap<String> headers = new MultiMap<>();
            for (String key : rqHeaders.keySet()) {
                if (NON_FORWARDED_HEADERS.contains(key)) { continue; }
                List<String> values = rqHeaders.getValues(key);
                headers.addValues(key, values);
            }
            
            // get proxy response
            ProxyResponse resp = getProxyResponse(
                method,
                urlString,
                jsonData,
                headers
            );
            
            // send response headers
            response.setStatus(resp.statusCode);
            for (String key : resp.headers.keySet()) {
                if (key == null) { continue; }
                List<String> values = resp.headers.get(key);
                for (String value : values) {
                    response.addHeader(key, value);
                }
            }
            
            // send response body
            try (OutputStream out = response.getOutputStream()) {
                out.write(resp.bodyBytes);
                out.flush();
            }
        }
    }
    
    
    ////// Static Methods //////
    public static MultiMap<String> getRequestHeaders(
        HttpServletRequest request
    )
    {
        MultiMap<String> result = new MultiMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                Enumeration<String> headerValues = request.getHeaders(headerName);
                if (headerValues == null) { continue; }
                while (headerValues.hasMoreElements()) {
                    String headerValue = headerValues.nextElement();
                    result.add(headerName, headerValue);
                }
            }
        }
        return result;
    }
    
    public static MultiMap<String> getProxyRequestBody(
        HttpServletRequest request
    ) throws IOException
    {
        MultiMap<String> result = new MultiMap<>();
        String characterEncoding = request.getCharacterEncoding();
        try (InputStream in = request.getInputStream()) {
            UrlEncoded.decodeTo(
                in,
                result,
                characterEncoding,
                Integer.MAX_VALUE,
                Integer.MAX_VALUE
            );
        }
        return result;
    }
    
    public static ProxyResponse getProxyResponse(
        String method,
        String urlString,
        String jsonData,
        MultiMap<String> headers
    )
        throws MalformedURLException, IOException
    {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection)url.openConnection();
        conn.setRequestMethod(method);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);
        // TODO: set headers if not null
        // TODO: set body data if not null
        conn.connect();
        
        ProxyResponse response = new ProxyResponse();
        response.statusCode = conn.getResponseCode();
        response.reason = conn.getResponseMessage();
        response.headers = conn.getHeaderFields();
        response.bodyBytes = getResponseBytes(conn);
        return response;
    }
    
    public static byte[] getResponseBytes(HttpURLConnection conn)
        throws IOException
    {
        int contentLength = conn.getContentLength();
        try (InputStream in = getAvailableResponse(conn)) {
            return readAllBytes(in, contentLength);
        }
    }
    
    public static byte[] readAllBytes(InputStream in, int length) 
        throws IOException
    {
        byte[] result;
        if (length < 0) {
            LiberatedBAOS baos = new LiberatedBAOS();
            baos.writeAll(in, 2048);
            result = baos.getBuffer();
        }
        else {
            result = new byte[length];
            in.read(result, 0, length);
        }
        return result;
    }
    
    public static InputStream getAvailableResponse(HttpURLConnection conn) 
        throws IOException 
    {
        InputStream availableInput;
        try {
            availableInput = conn.getInputStream();
        }
        catch (IOException ioex) {
            availableInput = conn.getErrorStream();
        }
        return availableInput;
    }
}
