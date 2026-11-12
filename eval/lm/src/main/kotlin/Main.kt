// Test server for .litertlm models (Gemma 4): same API as eval/server.py, using the same LiteRT-LM engine as the phone.
import com.google.ai.edge.litertlm.*
import com.sun.net.httpserver.HttpServer
import org.json.JSONObject
import java.io.File
import java.net.InetSocketAddress

val seed = (System.getenv("EVAL_SEED") ?: "1234").toInt()
lateinit var engine: Engine
var chat: Conversation? = null
var chatKey = ""
var chatSys = ""
var chatTemp = 0.35
val history = mutableListOf<Message>()
val log = File(System.getenv("RAW_LOG") ?: "raw.jsonl")

fun conv(sys: String?, temp: Double, initial: List<Message> = listOf()): Conversation =
    engine.createConversation(ConversationConfig(
        systemInstruction = sys?.let { Contents.of(it) },
        initialMessages = initial,
        samplerConfig = SamplerConfig(topK = 40, topP = 0.9, temperature = temp, seed = seed),
        maxOutputToken = 260,
    ))

fun main(args: Array<String>) {
    Engine.setNativeMinLogSeverity(LogSeverity.ERROR)
    engine = Engine(EngineConfig(modelPath = args[0], backend = Backend.CPU(), cacheDir = "/tmp"))
    engine.initialize()
    val server = HttpServer.create(InetSocketAddress("127.0.0.1", 8800), 0)
    server.createContext("/") { ex ->
        val body = JSONObject(ex.requestBody.readBytes().toString(Charsets.UTF_8).ifBlank { "{}" })
        var out = ""
        val t0 = System.currentTimeMillis()
        try {
            synchronized(engine) {
                when (ex.requestURI.path) {
                    "/chat" -> {
                        val key = body.getString("key"); val user = body.getString("user")
                        if (chat == null || key != chatKey) {
                            chat?.close(); history.clear()
                            chatKey = key; chatSys = body.getString("sys"); chatTemp = body.optDouble("temp", 0.35)
                            chat = conv(chatSys, chatTemp)
                        }
                        out = chat!!.sendMessage(Message.user(user)).toString()
                        history.add(Message.user(user)); history.add(Message.model(out))
                    }
                    "/gen" -> {
                        // a separate short conversation; the chat stays open (the engine runs sessions one after another)
                        conv(null, body.optDouble("temp", 0.2)).use { c -> out = c.sendMessage(Message.user(body.getString("prompt"))).toString() }
                    }
                    "/reset" -> { chat?.close(); chat = null; chatKey = ""; history.clear() }
                }
            }
        } catch (e: Throwable) { out = ""; System.err.println("error: $e") }
        val s = (System.currentTimeMillis() - t0) / 1000.0
        log.appendText(JSONObject(mapOf("path" to ex.requestURI.path, "out" to out, "s" to s)).toString() + "\n")
        val resp = JSONObject(mapOf("text" to out, "s" to s)).toString().toByteArray()
        ex.responseHeaders.add("Content-Type", "application/json"); ex.responseHeaders.add("Access-Control-Allow-Origin", "*"); ex.responseHeaders.add("Access-Control-Allow-Headers", "*")
        ex.sendResponseHeaders(200, resp.size.toLong()); ex.responseBody.use { it.write(resp) }
    }
    server.start()
    println("model loaded")
}
