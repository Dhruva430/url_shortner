package controllers

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"api/configs"
	"api/internal/db"
	"api/internal/models"
	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

type URLController struct {
	store *db.Queries
}

func NewURLController(store *db.Queries) *URLController {
	return &URLController{store: store}
}

func (c *URLController) CreateShortURL(ctx *gin.Context) {
	var req models.ShortURLRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.Error(err)
		return
	}
	var code string
	if req.Shortcode != "" {
		_, err := c.store.GetOriginalURL(ctx, req.Shortcode)
		if err == nil {
			ctx.JSON(409, gin.H{"error": "Shortcode already taken"})
			return
		} else if err != sql.ErrNoRows {
			ctx.JSON(500, gin.H{"error": "Database error"})
			return
		}
		code = req.Shortcode
	} else {
		var err error
		code, err = GetUniqueShortCode(ctx, c.store, 6, 10)
		println("Generated shortcode:", code)
		if err != nil {
			ctx.JSON(500, gin.H{"error": "Failed to generate unique shortcode"})
			return
		}
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var passwordHash sql.NullString
	if req.Password != "" {
		hash, err := utils.HashPassword(req.Password)
		if err != nil {
			ctx.JSON(500, gin.H{"error": "Failed to hash password"})
			return
		}
		passwordHash = sql.NullString{String: hash, Valid: true}
	} else {
		passwordHash = sql.NullString{Valid: false}
	}

	var expireAt sql.NullTime
	if req.ExpireAt != nil {
		if req.ExpireAt.Before(time.Now()) {
			ctx.JSON(400, gin.H{"error": "ExpireAt cannot be before the current time"})
			return
		}
		expireAt = sql.NullTime{Time: *req.ExpireAt, Valid: true}
	}
	domain, err := utils.GetDomain(req.OriginalURL)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid original URL"})
		return
	}
	thumbnail := "https://www.google.com/s2/favicons?sz=128&domain_url=" + domain

	arg := db.CreateShortURLParams{
		OriginalUrl:  req.OriginalURL,
		ShortCode:    code,
		Title:        sql.NullString{String: req.Title, Valid: req.Title != ""},
		PasswordHash: passwordHash,
		ExpireAt:     expireAt,
		UserID:       sql.NullInt32{Int32: int32(userID.(int64)), Valid: true},
		Thumbnail:    sql.NullString{String: thumbnail, Valid: true},
	}

	url, err := c.store.CreateShortURL(ctx, arg)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to create short URL"})
		return

	}
	formatted := time.Now().Format("02 Jan 2006")

	ctx.JSON(200, models.ShortURLResponse{
		ShortURL:  configs.GetAPIURL() + "/s/" + url.ShortCode,
		Thumbnail: utils.GetString(url.Thumbnail),
		Format:    formatted,
	})
}

func (c *URLController) GetUserURLs(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	links, err := c.store.GetUrlsByUserID(ctx, sql.NullInt32{Int32: int32(userID.(int64)), Valid: true})
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to fetch user links"})
		return
	}

	var result []models.LinkResponse

	for _, link := range links {
		var password bool = link.PasswordHash.String != ""
		result = append(result, models.LinkResponse{
			ID:          int64(link.ID),
			Title:       utils.NullToStr(link.Title),
			OriginalURL: link.OriginalUrl,
			ShortURL:    configs.GetAPIURL() + "/s/" + link.ShortCode,
			Thumbnail:   utils.NullToStr(link.Thumbnail),
			Clicks:      int(link.ClickCount),
			CreatedAt:   utils.FormatNullTime(link.CreatedAt),
			ExpireAt:    utils.FormatNullTime(link.ExpireAt),
			IsExpired:   isExpired(link.ExpireAt),
			Password:    password,
		})
	}

	ctx.JSON(200, result)
}

func isExpired(expireAt sql.NullTime) bool {
	if !expireAt.Valid {
		return false
	}
	return expireAt.Time.Before(time.Now())
}

func (c *URLController) RedirectToOriginalURL(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")
	password := ctx.Query("password")

	url, err := c.store.GetOriginalURL(ctx, shortcode)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Short URL not found"})
		return
	}

	if url.ExpireAt.Valid && url.ExpireAt.Time.Before(time.Now()) {
		ctx.JSON(http.StatusGone, gin.H{"error": "This short URL has expired"})
		return
	}

	ipAddress := utils.GetIP(ctx)
	userAgent := ctx.Request.UserAgent()
	referrer := ctx.Request.Referer()
	deviceType := utils.DetectDeviceTypeUA(userAgent)
	urlID := int32(url.ID)

	go func(shortCode string, urlID int32, deviceType, ipAddress, userAgent, referrer string) {
		_ = c.store.IncrementClickCount(context.Background(), shortCode)

		country, region, city := utils.ResolveGeoLocation(ipAddress)

		_ = c.store.LogURLVisit(context.Background(), db.LogURLVisitParams{
			UrlID:      urlID,
			IpAddress:  sql.NullString{String: ipAddress, Valid: ipAddress != ""},
			UserAgent:  sql.NullString{String: userAgent, Valid: userAgent != ""},
			DeviceType: sql.NullString{String: deviceType, Valid: deviceType != ""},
			Referrer:   sql.NullString{String: referrer, Valid: referrer != ""},
			Country:    sql.NullString{String: country, Valid: country != ""},
			Region:     sql.NullString{String: region, Valid: region != ""},
			City:       sql.NullString{String: city, Valid: city != ""},
		})
	}(shortcode, urlID, deviceType, ipAddress, userAgent, referrer)

	if url.PasswordHash.Valid && url.PasswordHash.String != "" {
		if password == "" {

			ctx.Redirect(http.StatusTemporaryRedirect, "https://uhxnpmnnw4r7.share.zrok.io/redirect/"+shortcode)
			return
		}

		if !utils.CheckPasswordHash(password, url.PasswordHash.String) {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Invalid password"})
			return
		}
	}

	ctx.Redirect(http.StatusFound, url.OriginalUrl)
}

func (c *URLController) VerifyAndRedirect(ctx *gin.Context) {
	shortCode := ctx.Param("shortcode")

	var req struct {
		Password string `json:"password"`
	}
	var response struct {
		OriginalURL string `json:"original_url"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	url, err := c.store.GetOriginalURL(ctx, shortCode)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Short URL not found"})
		return
	}

	if !url.PasswordHash.Valid || !utils.CheckPasswordHash(req.Password, url.PasswordHash.String) {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Invalid password"})
		return
	}

	response.OriginalURL = url.OriginalUrl

	ctx.JSON(http.StatusOK, response)
}

func (c *URLController) DeleteShortURL(ctx *gin.Context) {
	shortCode := ctx.Param("shortcode")

	if shortCode == "" {
		ctx.JSON(400, gin.H{"error": "Shortcode is required"})
		return
	}

	err := c.store.DeleteURLByShortCode(ctx, shortCode)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to delete URL"})
		return
	}

	ctx.JSON(200, gin.H{"message": "Deleted successfully"})
}

func GetUniqueShortCode(ctx *gin.Context, store *db.Queries, length, maxAttempts int) (string, error) {
	attempts := 0
	for {
		if attempts >= maxAttempts {
			return "", errors.New("failed to generate unique shortcode after multiple attempts")
		}
		code := utils.GenerateShortCode(length)
		_, err := store.GetOriginalURL(ctx, code)
		if err == sql.ErrNoRows {
			return code, nil
		} else if err != nil {
			return "", err
		}
		attempts++
	}
}

func (c *URLController) UpdateShortURL(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")
	if shortcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "shortcode is required"})
		return
	}

	var req models.EditURLRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	expireAt := sql.NullTime{Valid: false}
	if req.ExpireAt != "" {
		t, err := time.Parse(time.RFC3339, req.ExpireAt)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid expire_at format"})
			return
		}
		expireAt = sql.NullTime{Time: t, Valid: true}
	}

	if req.Title == "" || req.OriginalURL == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "title and original_url are required"})
		return
	}
	password, err := utils.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	args := db.UpdateShortURLParams{
		ShortCode:    shortcode,
		OriginalUrl:  req.OriginalURL,
		Title:        sql.NullString{String: req.Title, Valid: true},
		ExpireAt:     expireAt,
		PasswordHash: sql.NullString{String: password, Valid: req.Password != ""},
	}

	updated, err := c.store.UpdateShortURL(ctx, args)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update URL"})
		return
	}

	response := models.LinkResponse{
		ID:          int64(updated.ID),
		Title:       updated.Title.String,
		OriginalURL: updated.OriginalUrl,
		ShortURL:    configs.GetAPIURL() + "/s/" + updated.ShortCode,
		Clicks:      int(updated.ClickCount),
		CreatedAt:   utils.FormatNullTime(updated.CreatedAt),
		Thumbnail:   utils.NullToStr(updated.Thumbnail),
		ExpireAt:    utils.FormatNullTime(updated.ExpireAt),
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "link updated successfully",
		"data":    response,
	})
}

func (c *URLController) GetQRCode(ctx *gin.Context) {
	// print("Hello from GetQRCode")
	shortcode := ctx.Param("shortcode")
	if shortcode == "" {
		ctx.JSON(400, gin.H{"error": "Shortcode is required"})
		return
	}
	shortURL := configs.GetAPIURL() + "/s/" + shortcode

	qrCode, err := utils.GenerateQRCode(shortURL, 256)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to generate QR code"})
		return
	}

	ctx.Header("Content-Type", "image/png")
	ctx.Writer.Write(qrCode)
}

func (c *URLController) FetchQRCodeWithLogo(ctx *gin.Context) {
	rawURL := ctx.Query("url")
	fg_color := ctx.DefaultQuery("fg_color", "#000000")
	bg_color := ctx.DefaultQuery("bg_color", "#ffffff")
	logo_url := ctx.Query("logo_url")
	format := ctx.Query("format")
	// check format for png or jpeg
	if format == "" {
		format = "png"
	}
	if format != "png" && format != "jpeg" {
		ctx.JSON(400, gin.H{"error": "Unsupported format. Use png or jpeg"})
		return
	}

	if fg_color == "" {
		fg_color = "#000000"
	}
	if bg_color == "" {
		bg_color = "#ffffff"
	}

	fgColor, err := utils.ParseHexColor(fg_color)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid fg_color format"})
		return
	}

	bgColor, err := utils.ParseHexColor(bg_color)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid bg_color format"})
		return
	}

	if fgColor == bgColor {
		ctx.JSON(400, gin.H{"error": "fg_color and bg_color cannot be the same"})
		return
	}

	qrBytes, err := utils.GenerateQRCodeWithLogos(rawURL, logo_url, 512, "png", fgColor, bgColor)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to generate QR code with logo"})
		return
	}

	switch fg_color {
	case "jpeg":
		ctx.Header("Content-Type", "image/jpeg")
	default:
		ctx.Header("Content-Type", "image/png")
	}
	ctx.Writer.Write(qrBytes)
}

func (c *URLController) GetDeviceTypeStats(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	params := sql.NullInt32{
		Int32: int32(userID),
		Valid: true,
	}

	stats, err := c.store.GetDeviceTypeStatsByUser(ctx, params)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch device type stats"})
		return
	}

	// 🛠️ Ensure non-nil slice is returned
	if stats == nil {
		stats = []db.GetDeviceTypeStatsByUserRow{}
	}

	ctx.JSON(http.StatusOK, stats)
}

func (c *URLController) GetLineChartStats(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	data, err := c.store.GetDailyClicksAndLinksByUser(ctx, sql.NullInt32{
		Int32: int32(userID),
		Valid: true,
	})
	if err != nil {
		fmt.Printf("Error from GetDailyClicksAndLinksByUser: %v\n", err) // Log error for debug
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load chart data"})
		return
	}

	if data == nil {
		data = []db.GetDailyClicksAndLinksByUserRow{}
	}

	ctx.JSON(http.StatusOK, data)
}

func (c *URLController) GetMonthlyClicks(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	rows, err := c.store.GetMonthlyClicksByUser(ctx, sql.NullInt32{
		Int32: int32(userID),
		Valid: true,
	})
	if err != nil {
		fmt.Println("GetMonthlyClicksByUser ERROR:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load bar chart data"})
		return
	}

	ctx.JSON(http.StatusOK, rows)
}

func (a *URLController) GetWorldMapData(ctx *gin.Context) {
	userID := ctx.GetInt64("user_id")

	daysStr := ctx.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid days parameter"})
		return
	}

	args := db.GetCountryVisitCountsByUserParams{UserID: sql.NullInt32{Int32: int32(userID), Valid: true}, Days: int32(days)}
	stats, err := a.store.GetCountryVisitCountsByUser(ctx, args)
	fmt.Println(stats)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch country stats"})
		return
	}

	ctx.JSON(http.StatusOK, stats)
}

func (a *URLController) GetDashboardData(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}

	summary, err := a.store.GetDashboardSummaryByUser(ctx, sql.NullInt32{
		Int32: int32(userID),
		Valid: true,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, summary)
}

func (c *URLController) GetClicksByShortcode(ctx *gin.Context) {
	userID := ctx.GetInt64("user_id")
	shortcode := ctx.Param("shortcode")

	if shortcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "shortcode is required"})
		return
	}

	url, err := c.store.GetOriginalURL(ctx, shortcode)
	if err != nil || !url.UserID.Valid || int64(url.UserID.Int32) != userID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "URL not found or access denied"})
		return
	}
	clicks, err := c.store.GetDailyClicksScoped(ctx, db.GetDailyClicksScopedParams{
		ShortCode: shortcode,
		UserID: sql.NullInt32{
			Int32: int32(userID),
		},
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch clicks"})
		return
	}

	ctx.JSON(http.StatusOK, clicks)
}

func (c *URLController) GetPieChartDataByShorcode(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")

	stats, err := c.store.GetDeviceStatsByShortcode(ctx, shortcode)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch device stats"})
		return
	}
	if stats == nil {
		stats = []db.GetDeviceStatsByShortcodeRow{}
	}

	ctx.JSON(http.StatusOK, stats)
}

func (c *URLController) GetTitleAndUrlByUser(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	titles, err := c.store.GetTitleAndUrlByUser(ctx, sql.NullInt32{Int32: int32(userID.(int64)), Valid: true})
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to fetch titles and URLs"})
		return
	}

	var result []models.PieChart
	for _, title := range titles {
		result = append(result, models.PieChart{
			ID:        int64(title.ID),
			Title:     title.Title.String,
			Shortcode: title.ShortCode,
		})
	}

	ctx.JSON(200, result)
}

func (c *URLController) LineChartStatsByShortcode(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")
	if shortcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "shortcode is required"})
		return
	}

	stats, err := c.store.GetDailyClicksScoped(ctx, db.GetDailyClicksScopedParams{
		ShortCode: shortcode,
		UserID: sql.NullInt32{
			Int32: int32(ctx.GetInt64("user_id")),
			Valid: true,
		},
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch line chart stats"})
		return
	}

	if stats == nil {
		stats = []db.GetDailyClicksScopedRow{}
	}
	ctx.JSON(http.StatusOK, stats)
}

func (c *URLController) GetWorldMapStatsByShortcode(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")
	days := ctx.DefaultQuery("days", "30")

	if shortcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "shortcode is required"})
		return
	}
	userID := ctx.GetInt64("user_id")

	stats, err := c.store.GetCountryStatsScoped(ctx, db.GetCountryStatsScopedParams{
		ShortCode: shortcode,
		UserID: sql.NullInt32{
			Int32: int32(userID),
			Valid: true,
		},
		Days: int32(utils.ParseDaysParam(days)),
	})

	// remove unknown countries from stats
	var filteredStats []db.GetCountryStatsScopedRow
	for _, s := range stats {
		if s.Country != "unknown" {
			filteredStats = append(filteredStats, s)
		}
	}
	stats = filteredStats
	println("World map stats:", stats)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch world map stats"})
		return
	}
	if stats == nil {
		stats = []db.GetCountryStatsScopedRow{}
	}
	ctx.JSON(http.StatusOK, stats)
}

func (c *URLController) GetBarChartStatsByShortcode(ctx *gin.Context) {
	shortcode := ctx.Param("shortcode")
	if shortcode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "shortcode is required"})
		return
	}

	userID := ctx.GetInt64("user_id")

	stats, err := c.store.GetMonthlyClicksScoped(ctx, db.GetMonthlyClicksScopedParams{
		ShortCode: shortcode,
		UserID: sql.NullInt32{
			Int32: int32(userID),
			Valid: true,
		},
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bar chart stats"})
		return
	}

	if stats == nil {
		stats = []db.GetMonthlyClicksScopedRow{}
	}
	ctx.JSON(http.StatusOK, stats)
}
