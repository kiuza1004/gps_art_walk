package com.gpsart.app

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.DashPathEffect
import android.location.Location
import android.app.AlertDialog
import android.os.Bundle
import android.os.Looper
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Polyline
import org.osmdroid.views.overlay.ScaleBarOverlay
import android.view.MotionEvent
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    companion object {
        private const val LOCATION_PERMISSION_CODE = 1001
        private const val TRACKING_INTERVAL_MS = 1000L
    }

    // Views
    private lateinit var mapView: MapView
    private lateinit var spinnerMode: Spinner
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button
    private lateinit var btnClear: Button
    private lateinit var btnMyLocation: Button
    private lateinit var tvStatus: TextView
    private lateinit var tvCoords: TextView
    private lateinit var tvCurrentShape: TextView

    // Location
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var locationCallback: LocationCallback? = null

    // State
    private var isTracking = false
    private var restoringMode = false
    private var currentMode = Mode.FREE_DRAW

    // Drawing data
    private val trackPoints = mutableListOf<GeoPoint>()
    private val guidePoints = mutableListOf<GeoPoint>()
    private var trackPolyline: Polyline? = null
    private var guidePolyline: Polyline? = null

    enum class Mode {
        FREE_DRAW,
        FOLLOW_ROUTE
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // osmdroid configuration
        Configuration.getInstance().load(applicationContext,
            getSharedPreferences("osmdroid_prefs", MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = packageName

        setContentView(R.layout.activity_main)

        initViews()
        initMap()
        initModeSpinner()
        initButtons()
        initLocationClient()
        requestLocationPermission()
        loadDrawingData()
    }

    private fun initViews() {
        mapView = findViewById(R.id.mapView)
        spinnerMode = findViewById(R.id.spinnerMode)
        btnStart = findViewById(R.id.btnStart)
        btnStop = findViewById(R.id.btnStop)
        btnClear = findViewById(R.id.btnClear)
        btnMyLocation = findViewById(R.id.btnMyLocation)
        tvStatus = findViewById(R.id.tvStatus)
        tvCoords = findViewById(R.id.tvCoords)
        tvCurrentShape = findViewById(R.id.tvCurrentShape)
    }

    private fun initMap() {
        mapView.setTileSource(TileSourceFactory.MAPNIK)
        mapView.setMultiTouchControls(true)
        mapView.controller.setZoom(17.0)
        // Default center (Seoul)
        mapView.controller.setCenter(GeoPoint(37.5665, 126.9780))

        // 화면에 거리 척도(Scale Bar) 추가
        val scaleBarOverlay = ScaleBarOverlay(mapView)
        scaleBarOverlay.setCentred(true)
        val dm = resources.displayMetrics
        // 상단 모드 패널 아래쪽에 위치하도록 오프셋 설정 (가운데 정렬)
        scaleBarOverlay.setScaleBarOffset(dm.widthPixels / 2 - 60, 250)
        mapView.overlays.add(scaleBarOverlay)
    }

    private fun initModeSpinner() {
        val modes = arrayOf(
            getString(R.string.mode_free_draw),
            getString(R.string.mode_follow_route),
            getString(R.string.mode_auto_shape)
        )
        val adapter = ArrayAdapter(this, R.layout.item_spinner, modes)
        adapter.setDropDownViewResource(R.layout.item_spinner_dropdown)
        spinnerMode.adapter = adapter

        spinnerMode.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                when (position) {
                    0 -> switchMode(Mode.FREE_DRAW)
                    1 -> switchMode(Mode.FOLLOW_ROUTE)
                    2 -> showAutoShapeDialog()
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun switchMode(mode: Mode) {
        // 이미 해당 모드인 경우(예: 앱 시작 시 자동 호출) 무시하여 데이터 초기화(clearAll) 방지
        if (currentMode == mode) return

        if (isTracking) {
            stopTracking()
        }
        currentMode = mode

        // 사용자가 직접 모드를 변경한 경우에만 기존 데이터 초기화
        clearAll()

        when (mode) {
            Mode.FREE_DRAW -> {
                removeMapTapListener()
                updateStatus(getString(R.string.status_ready))
            }
            Mode.FOLLOW_ROUTE -> {
                setupMapTapListener()
                updateStatus(getString(R.string.status_draw_guide))
            }
        }
        updateButtonStates()
    }

    private fun initButtons() {
        btnStart.setOnClickListener { startTracking() }
        btnStop.setOnClickListener { stopTracking() }
        btnClear.setOnClickListener {
            if (isTracking) stopTracking()
            clearAll()
            when (currentMode) {
                Mode.FREE_DRAW -> updateStatus(getString(R.string.status_ready))
                Mode.FOLLOW_ROUTE -> {
                    setupMapTapListener()
                    updateStatus(getString(R.string.status_draw_guide))
                }
            }
        }
        btnMyLocation.setOnClickListener { findMyLocation() }
        updateButtonStates()
    }

    private fun initLocationClient() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
    }

    // --- Permission Handling ---

    private fun requestLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                LOCATION_PERMISSION_CODE
            )
        } else {
            onPermissionGranted()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                onPermissionGranted()
            } else {
                updateStatus(getString(R.string.permission_denied))
                btnStart.isEnabled = false
            }
        }
    }

    private fun onPermissionGranted() {
        moveToLastKnownLocation()
    }

    @Suppress("MissingPermission")
    private fun moveToLastKnownLocation() {
        fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
            location?.let {
                val geoPoint = GeoPoint(it.latitude, it.longitude)
                mapView.controller.animateTo(geoPoint)
                tvCoords.text = String.format("위도: %.6f, 경도: %.6f", it.latitude, it.longitude)
            }
        }
    }

    // --- Tracking ---

    @Suppress("MissingPermission")
    private fun startTracking() {
        if (isTracking) return

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            requestLocationPermission()
            return
        }

        isTracking = true
        trackPoints.clear()
        removeTrackPolyline()

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY, TRACKING_INTERVAL_MS
        ).setMinUpdateIntervalMillis(TRACKING_INTERVAL_MS).build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    val point = GeoPoint(location.latitude, location.longitude)
                    trackPoints.add(point)
                    updateTrackPolyline()
                    tvCoords.text = String.format(
                        "위도: %.6f, 경도: %.6f", location.latitude, location.longitude
                    )
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            locationRequest, locationCallback!!, Looper.getMainLooper()
        )

        when (currentMode) {
            Mode.FREE_DRAW -> updateStatus(getString(R.string.status_recording))
            Mode.FOLLOW_ROUTE -> {
                removeMapTapListener()
                updateStatus(getString(R.string.status_following))
            }
        }
        updateButtonStates()
    }

    private fun stopTracking() {
        if (!isTracking) return

        isTracking = false
        locationCallback?.let {
            fusedLocationClient.removeLocationUpdates(it)
        }
        locationCallback = null

        updateStatus(getString(R.string.status_stopped))
        updateButtonStates()
    }

    // --- Drawing ---

    private fun updateTrackPolyline() {
        removeTrackPolyline()

        if (trackPoints.size < 2) return

        trackPolyline = Polyline().apply {
            setPoints(ArrayList(trackPoints))
            outlinePaint.color = Color.parseColor("#2196F3")
            outlinePaint.strokeWidth = 10f
            outlinePaint.isAntiAlias = true
        }
        mapView.overlays.add(trackPolyline)
        mapView.invalidate()
    }

    private fun removeTrackPolyline() {
        trackPolyline?.let {
            mapView.overlays.remove(it)
        }
        trackPolyline = null
    }

    private fun updateGuidePolyline() {
        removeGuidePolyline()

        if (guidePoints.size < 2) return

        guidePolyline = Polyline().apply {
            setPoints(ArrayList(guidePoints))
            outlinePaint.color = Color.parseColor("#9E9E9E")
            outlinePaint.strokeWidth = 8f
            outlinePaint.pathEffect = DashPathEffect(floatArrayOf(20f, 15f), 0f)
            outlinePaint.isAntiAlias = true
        }
        mapView.overlays.add(guidePolyline)
        mapView.invalidate()

        if (guidePoints.size >= 2) {
            updateStatus(getString(R.string.status_guide_done))
        }
    }

    private fun removeGuidePolyline() {
        guidePolyline?.let {
            mapView.overlays.remove(it)
        }
        guidePolyline = null
    }

    // --- Map Drawing for Guide ---

    private var guideTouchListener: View.OnTouchListener? = null
    private var lastDrawX = 0f
    private var lastDrawY = 0f
    private val DRAW_MIN_DISTANCE = 30f // 수집 간격을 늘려 불필요한 점 억제
    private var strokeStartIndex = 0
    private var isSnapping = false

    private fun setupMapTapListener() {
        removeMapTapListener()

        guideTouchListener = View.OnTouchListener { _, event ->
            if (isTracking || isSnapping) return@OnTouchListener false

            when {
                event.pointerCount > 1 -> false // 핀치 줌 허용
                else -> when (event.actionMasked) {
                    MotionEvent.ACTION_DOWN -> {
                        strokeStartIndex = guidePoints.size
                        lastDrawX = event.x
                        lastDrawY = event.y
                        addGuidePoint(event.x, event.y)
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = event.x - lastDrawX
                        val dy = event.y - lastDrawY
                        if (dx * dx + dy * dy >= DRAW_MIN_DISTANCE * DRAW_MIN_DISTANCE) {
                            lastDrawX = event.x
                            lastDrawY = event.y
                            addGuidePoint(event.x, event.y)
                        }
                        true
                    }
                    MotionEvent.ACTION_UP -> {
                        addGuidePoint(event.x, event.y)
                        snapStrokeToRoad(strokeStartIndex)
                        true
                    }
                    else -> true
                }
            }
        }
        mapView.setOnTouchListener(guideTouchListener)
    }

    private fun addGuidePoint(x: Float, y: Float) {
        val geoPoint = mapView.projection.fromPixels(x.toInt(), y.toInt()) as GeoPoint
        guidePoints.add(geoPoint)
        updateGuidePolyline()
    }

    private fun snapStrokeToRoad(startIndex: Int) {
        val strokePoints = guidePoints.subList(startIndex, guidePoints.size).toList()
        if (strokePoints.size < 2) return

        isSnapping = true
        updateStatus(getString(R.string.status_snapping))

        // OSRM 데모 서버의 엄격한 제한을 피하기 위해 한 번의 선 긋기당 최대 25개 포인트만 추출
        val MAX_POINTS = 25
        val sampled = if (strokePoints.size > MAX_POINTS) {
            val step = strokePoints.size.toFloat() / MAX_POINTS.toFloat()
            (0 until MAX_POINTS).map { strokePoints[(it * step).toInt()] }
        } else {
            strokePoints
        }

        val coordinates = sampled.joinToString(";") {
            String.format(java.util.Locale.US, "%.6f,%.6f", it.longitude, it.latitude)
        }
        
        // radiuses 파라미터를 제거하여 Radius search size is too large 오류 방지
        val apiUrl = "https://router.project-osrm.org/match/v1/driving/" +
            "$coordinates?overview=full&geometries=geojson"

        Thread {
            try {
                val conn = URL(apiUrl).openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.connectTimeout = 10000
                conn.readTimeout = 10000
                conn.setRequestProperty("User-Agent", "GPSArt/1.0")

                val responseCode = conn.responseCode
                if (responseCode == 200) {
                    val response = conn.inputStream.bufferedReader().readText()
                    conn.disconnect()
                    val json = JSONObject(response)

                    if (json.getString("code") == "Ok") {
                        val matchings = json.getJSONArray("matchings")
                        val snapped = mutableListOf<GeoPoint>()

                        for (i in 0 until matchings.length()) {
                            val coords = matchings.getJSONObject(i)
                                .getJSONObject("geometry")
                                .getJSONArray("coordinates")
                            for (j in 0 until coords.length()) {
                                val c = coords.getJSONArray(j)
                                snapped.add(GeoPoint(c.getDouble(1), c.getDouble(0)))
                            }
                        }

                        if (snapped.isNotEmpty()) {
                            runOnUiThread {
                                val removeCount = guidePoints.size - startIndex
                                for (i in 0 until removeCount) {
                                    guidePoints.removeAt(startIndex)
                                }
                                guidePoints.addAll(startIndex, snapped)
                                updateGuidePolyline()
                                isSnapping = false
                            }
                            return@Thread
                        }
                    }

                    val code = json.optString("code", "Unknown")
                    runOnUiThread {
                        isSnapping = false
                        showErrorDialog("도로 매칭 실패: $code")
                        if (guidePoints.size >= 2) updateStatus(getString(R.string.status_guide_done))
                    }
                } else {
                    val errorResponse = try {
                        conn.errorStream.bufferedReader().readText()
                    } catch (e: Exception) { "" }
                    conn.disconnect()

                    var errorMsg = "서버 응답 오류: $responseCode"
                    try {
                        if (errorResponse.isNotEmpty()) {
                            val json = JSONObject(errorResponse)
                            val message = json.optString("message", "")
                            if (message.isNotEmpty()) errorMsg += "\n\n상세 내용: $message"
                        }
                    } catch (_: Exception) {}

                    runOnUiThread {
                        isSnapping = false
                        showErrorDialog(errorMsg)
                        if (guidePoints.size >= 2) updateStatus(getString(R.string.status_guide_done))
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    isSnapping = false
                    showErrorDialog("네트워크 오류: ${e.message}")
                    if (guidePoints.size >= 2) updateStatus(getString(R.string.status_guide_done))
                }
            }
        }.start()
    }

    private fun showErrorDialog(message: String) {
        AlertDialog.Builder(this)
            .setTitle("알림")
            .setMessage(message)
            .setPositiveButton("확인", null)
            .show()
    }

    private fun removeMapTapListener() {
        if (guideTouchListener != null) {
            mapView.setOnTouchListener(null)
            guideTouchListener = null
        }
    }

    // --- Helpers ---

    private fun clearAll() {
        trackPoints.clear()
        guidePoints.clear()
        removeTrackPolyline()
        removeGuidePolyline()
        removeMapTapListener()
        clearSavedData()
        tvCurrentShape.visibility = View.GONE
        mapView.invalidate()
    }

    private fun updateStatus(message: String) {
        tvStatus.text = message
    }

    private fun updateButtonStates() {
        btnStart.isEnabled = !isTracking
        btnStop.isEnabled = isTracking
        spinnerMode.isEnabled = !isTracking
    }

    // --- My Location ---

    private fun findMyLocation() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED) {
            moveToLastKnownLocation()
        } else {
            requestLocationPermission()
        }
    }

    // --- Data Persistence ---

    private fun saveDrawingData() {
        val prefs = getSharedPreferences("drawing_data", MODE_PRIVATE)
        val editor = prefs.edit()

        val trackArray = JSONArray()
        for (point in trackPoints) {
            val obj = JSONObject()
            obj.put("lat", point.latitude)
            obj.put("lon", point.longitude)
            trackArray.put(obj)
        }
        editor.putString("track_points", trackArray.toString())

        val guideArray = JSONArray()
        for (point in guidePoints) {
            val obj = JSONObject()
            obj.put("lat", point.latitude)
            obj.put("lon", point.longitude)
            guideArray.put(obj)
        }
        editor.putString("guide_points", guideArray.toString())
        editor.putInt("current_mode", currentMode.ordinal)
        editor.apply()
    }

    private fun loadDrawingData() {
        val prefs = getSharedPreferences("drawing_data", MODE_PRIVATE)

        val trackJson = prefs.getString("track_points", null)
        if (trackJson != null) {
            try {
                val arr = JSONArray(trackJson)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    trackPoints.add(GeoPoint(obj.getDouble("lat"), obj.getDouble("lon")))
                }
            } catch (_: Exception) {}
        }

        val guideJson = prefs.getString("guide_points", null)
        if (guideJson != null) {
            try {
                val arr = JSONArray(guideJson)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    guidePoints.add(GeoPoint(obj.getDouble("lat"), obj.getDouble("lon")))
                }
            } catch (_: Exception) {}
        }

        if (trackPoints.isEmpty() && guidePoints.isEmpty()) return

        // 선 데이터 화면에 그리기
        if (trackPoints.size >= 2) updateTrackPolyline()
        if (guidePoints.size >= 2) updateGuidePolyline()

        // 앱 시작 시 무조건 '자유 그리기' 모드로 설정하여 원치 않는 도로 맞추기(터치 그리기) 방지
        currentMode = Mode.FREE_DRAW
        spinnerMode.setSelection(0)
        removeMapTapListener()
        updateStatus(getString(R.string.status_ready))
    }

    private fun clearSavedData() {
        val prefs = getSharedPreferences("drawing_data", MODE_PRIVATE)
        prefs.edit().clear().apply()
    }

    // --- Lifecycle ---

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
        saveDrawingData()
        if (isTracking) {
            stopTracking()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mapView.onDetach()
    }

    // --- Auto Shape Generation ---

    private fun showAutoShapeDialog() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
        }

        val shapeSpinner = Spinner(this).apply {
            adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_dropdown_item, 
                arrayOf(
                    getString(R.string.shape_dog), getString(R.string.shape_cat),
                    getString(R.string.shape_dinosaur), getString(R.string.shape_bird),
                    getString(R.string.shape_heart), getString(R.string.shape_star),
                    getString(R.string.shape_car), getString(R.string.shape_fish),
                    getString(R.string.shape_house), getString(R.string.shape_crown)
                ))
        }
        
        val tvDistance = TextView(this).apply {
            text = "최대 허용 길이: 5.0 km"
            textSize = 16f
            setPadding(0, 30, 0, 10)
            setTextColor(Color.BLACK)
        }

        val seekBar = SeekBar(this).apply {
            max = 95 // 0.5km ~ 10.0km (step: 0.1km)
            progress = 45 // Default 5.0km
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                    val km = 0.5 + progress * 0.1
                    tvDistance.text = String.format("최대 허용 길이: %.1f km", km)
                }
                override fun onStartTrackingTouch(seekBar: SeekBar?) {}
                override fun onStopTrackingTouch(seekBar: SeekBar?) {}
            })
        }

        layout.addView(shapeSpinner)
        layout.addView(tvDistance)
        layout.addView(seekBar)

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.dialog_shape_title))
            .setView(layout)
            .setPositiveButton("지도에 띄우기") { _, _ ->
                val shapeType = shapeSpinner.selectedItemPosition
                val maxLengthKm = 0.5 + seekBar.progress * 0.1
                generateShape(shapeType, maxLengthKm)
            }
            .setNegativeButton("취소") { _, _ ->
                spinnerMode.setSelection(currentMode.ordinal)
            }
            .setOnCancelListener {
                spinnerMode.setSelection(currentMode.ordinal)
            }
            .show()
    }

    private fun interpolateShape(basePoints: List<Pair<Double, Double>>, targetCount: Int = 60): List<Pair<Double, Double>> {
        if (basePoints.isEmpty()) return emptyList()
        val result = mutableListOf<Pair<Double, Double>>()
        var totalLen = 0.0
        val distances = mutableListOf<Double>()
        for (i in 0 until basePoints.size - 1) {
            val d = Math.hypot(basePoints[i+1].first - basePoints[i].first, basePoints[i+1].second - basePoints[i].second)
            distances.add(d)
            totalLen += d
        }
        if (totalLen == 0.0) return basePoints
        val step = totalLen / (targetCount - 1)
        var currentDist = 0.0
        var currentSegment = 0
        var segmentCovered = 0.0

        result.add(basePoints[0])
        for (i in 1 until targetCount - 1) {
            val targetDist = i * step
            while (currentSegment < distances.size && currentDist + (distances[currentSegment] - segmentCovered) < targetDist) {
                currentDist += distances[currentSegment] - segmentCovered
                currentSegment++
                segmentCovered = 0.0
            }
            if (currentSegment >= basePoints.size - 1) break
            val remaining = targetDist - currentDist
            val ratio = (segmentCovered + remaining) / distances[currentSegment]
            val p1 = basePoints[currentSegment]
            val p2 = basePoints[currentSegment+1]
            val x = p1.first + (p2.first - p1.first) * ratio
            val y = p1.second + (p2.second - p1.second) * ratio
            result.add(Pair(x, y))
            segmentCovered += remaining
            currentDist = targetDist
        }
        result.add(basePoints.last())
        return result
    }

    private fun generateShape(shapeType: Int, maxLengthKm: Double) {
        clearAll()
        currentMode = Mode.FREE_DRAW
        spinnerMode.setSelection(0)
        removeMapTapListener()
        
        val center = mapView.mapCenter as GeoPoint
        val basePoints = mutableListOf<Pair<Double, Double>>()
        var idealLengthKm = 2.0 // 도형별 최적 비율 (기본 2.0)

        when (shapeType) {
            0 -> { // 강아지
                idealLengthKm = 2.0
                basePoints.addAll(listOf(Pair(-0.5, -0.6), Pair(-0.5, -0.1), Pair(-0.8, 0.2), Pair(-0.5, 0.3), Pair(-0.4, 0.4), Pair(0.2, 0.4), Pair(0.3, 0.8), Pair(0.5, 0.7), Pair(0.7, 0.4), Pair(0.6, 0.2), Pair(0.4, 0.2), Pair(0.3, -0.1), Pair(0.3, -0.6), Pair(0.1, -0.6), Pair(0.1, -0.2), Pair(-0.3, -0.2), Pair(-0.3, -0.6), Pair(-0.5, -0.6)))
            }
            1 -> { // 고양이
                idealLengthKm = 1.5
                basePoints.addAll(listOf(Pair(-0.5,-0.5), Pair(-0.6,-0.1), Pair(-0.9,0.4), Pair(-0.7,0.5), Pair(-0.5,0.2), Pair(-0.3,0.4), Pair(0.3,0.4), Pair(0.4,0.8), Pair(0.6,0.6), Pair(0.8,0.7), Pair(0.9,0.4), Pair(0.7,0.2), Pair(0.6,-0.1), Pair(0.7,-0.5), Pair(0.5,-0.5), Pair(0.4,-0.2), Pair(-0.2,-0.2), Pair(-0.3,-0.5), Pair(-0.5,-0.5)))
            }
            2 -> { // 공룡
                idealLengthKm = 3.0
                basePoints.addAll(listOf(Pair(-0.6,-0.7), Pair(-0.6,-0.2), Pair(-0.9,0.1), Pair(-0.9,0.3), Pair(-0.5,0.1), Pair(-0.3,0.5), Pair(-0.1,0.8), Pair(0.4,0.8), Pair(0.7,0.9), Pair(0.9,0.7), Pair(0.9,0.5), Pair(0.4,0.5), Pair(0.5,0.3), Pair(0.3,0.3), Pair(0.1,0.1), Pair(0.1,-0.3), Pair(-0.1,-0.3), Pair(-0.1,-0.1), Pair(-0.3,-0.1), Pair(-0.4,-0.7), Pair(-0.6,-0.7)))
            }
            3 -> { // 새
                idealLengthKm = 2.5
                basePoints.addAll(listOf(Pair(-0.8,0.0), Pair(-0.4,0.2), Pair(-0.2,0.6), Pair(0.0,0.2), Pair(0.4,0.3), Pair(0.8,0.1), Pair(0.6,-0.1), Pair(0.2,-0.1), Pair(0.0,-0.4), Pair(-0.2,-0.1), Pair(-0.6,-0.2), Pair(-0.8,0.0)))
            }
            4 -> { // 하트
                idealLengthKm = 1.5
                for (i in 0..36) {
                    val t = i * (2 * Math.PI / 36)
                    val x = 16 * Math.pow(Math.sin(t), 3.0)
                    val y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
                    basePoints.add(Pair(x / 16.0, y / 16.0))
                }
            }
            5 -> { // 별
                idealLengthKm = 2.0
                for (i in 0..10) {
                    val angle = i * (Math.PI / 5) - Math.PI / 2
                    val r = if (i % 2 == 0) 1.0 else 0.4
                    basePoints.add(Pair(r * Math.cos(angle), r * Math.sin(angle) * -1.0))
                }
            }
            6 -> { // 자동차
                idealLengthKm = 2.0
                basePoints.addAll(listOf(Pair(-0.8,-0.4), Pair(-0.8,0.0), Pair(-0.5,0.0), Pair(-0.3,0.5), Pair(0.3,0.5), Pair(0.5,0.0), Pair(0.8,0.0), Pair(0.8,-0.4), Pair(0.5,-0.4), Pair(0.5,-0.6), Pair(0.3,-0.6), Pair(0.3,-0.4), Pair(-0.3,-0.4), Pair(-0.3,-0.6), Pair(-0.5,-0.6), Pair(-0.5,-0.4), Pair(-0.8,-0.4)))
            }
            7 -> { // 물고기
                idealLengthKm = 1.5
                basePoints.addAll(listOf(Pair(-0.8,-0.4), Pair(-0.8,0.4), Pair(-0.4,0.0), Pair(0.0,0.5), Pair(0.6,0.3), Pair(0.8,0.0), Pair(0.6,-0.3), Pair(0.0,-0.5), Pair(-0.4,0.0), Pair(-0.8,-0.4)))
            }
            8 -> { // 집
                idealLengthKm = 1.5
                basePoints.addAll(listOf(Pair(-0.6,-0.6), Pair(-0.6,0.0), Pair(-0.8,0.0), Pair(0.0,0.7), Pair(0.8,0.0), Pair(0.6,0.0), Pair(0.6,-0.6), Pair(-0.6,-0.6)))
            }
            9 -> { // 왕관
                idealLengthKm = 2.0
                basePoints.addAll(listOf(Pair(-0.7,-0.5), Pair(-0.9,0.5), Pair(-0.4,0.1), Pair(0.0,0.7), Pair(0.4,0.1), Pair(0.9,0.5), Pair(0.7,-0.5), Pair(-0.7,-0.5)))
            }
        }

        // 고해상도 처리(60개 점으로 쪼개기)를 통해 OSRM 도로 매칭 시 자연스러운 형태 유지 유도
        val rawPoints = interpolateShape(basePoints, 60)

        // 전체 코스 길이가 사용자가 지정한 최대 길이(maxLengthKm)를 넘지 않도록 제한
        val finalLengthKm = Math.min(idealLengthKm, maxLengthKm)

        // 상대 좌표계 내에서의 도형 둘레 길이 산출
        var totalLengthRaw = 0.0
        for (i in 0 until rawPoints.size - 1) {
            val dx = rawPoints[i+1].first - rawPoints[i].first
            val dy = rawPoints[i+1].second - rawPoints[i].second
            totalLengthRaw += Math.sqrt(dx*dx + dy*dy)
        }
        
        // 최종 맵핑할 비율 계산
        val scale = if (totalLengthRaw > 0) finalLengthKm / totalLengthRaw else 1.0

        val idealGeoPoints = rawPoints.map { p ->
            val dLat = (p.second * scale) / 111.32
            val dLon = (p.first * scale) / (111.32 * Math.cos(Math.toRadians(center.latitude)))
            GeoPoint(center.latitude + dLat, center.longitude + dLon)
        }

        updateStatus("도로 코스 탐색 중...")

        val coordinates = idealGeoPoints.joinToString(";") {
            String.format(java.util.Locale.US, "%.6f,%.6f", it.longitude, it.latitude)
        }

        // 대안 2: 고해상도 점들을 OSRM route API에 던져 실제 도로 경로 획득
        val apiUrl = "https://router.project-osrm.org/route/v1/driving/$coordinates?overview=full&geometries=geojson"

        Thread {
            try {
                val conn = URL(apiUrl).openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.connectTimeout = 15000
                conn.readTimeout = 15000
                conn.setRequestProperty("User-Agent", "GPSArt/1.0")

                val responseCode = conn.responseCode
                if (responseCode == 200) {
                    val response = conn.inputStream.bufferedReader().readText()
                    conn.disconnect()
                    val json = JSONObject(response)

                    if (json.getString("code") == "Ok") {
                        val routes = json.getJSONArray("routes")
                        val coords = routes.getJSONObject(0)
                            .getJSONObject("geometry")
                            .getJSONArray("coordinates")
                            
                        val snapped = mutableListOf<GeoPoint>()
                        for (i in 0 until coords.length()) {
                            val c = coords.getJSONArray(i)
                            snapped.add(GeoPoint(c.getDouble(1), c.getDouble(0)))
                        }

                        if (snapped.isNotEmpty()) {
                            runOnUiThread {
                                guidePoints.addAll(snapped)
                                updateGuidePolyline()
                                updateStatus(getString(R.string.status_guide_done))
                                val names = arrayOf("강아지", "고양이", "공룡", "새", "하트", "별", "자동차", "물고기", "집", "왕관")
                                tvCurrentShape.text = "모양: ${names[shapeType]}"
                                tvCurrentShape.visibility = View.VISIBLE
                            }
                            return@Thread
                        }
                    }
                }
                conn.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // 도로 탐색 실패 시 찌그러지지 않은 고해상도 기본 도형으로 대체
            runOnUiThread {
                guidePoints.addAll(idealGeoPoints)
                updateGuidePolyline()
                showErrorDialog("주변 도로망을 찾을 수 없어 기본 도형으로 표시합니다.")
                updateStatus(getString(R.string.status_guide_done))
                val names = arrayOf("강아지", "고양이", "공룡", "새", "하트", "별", "자동차", "물고기", "집", "왕관")
                tvCurrentShape.text = "모양: ${names[shapeType]}"
                tvCurrentShape.visibility = View.VISIBLE
            }
        }.start()
    }
}
