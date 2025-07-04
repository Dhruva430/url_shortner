package errors

type AppError struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
	Err     error  `json:"-"`
}

func (e AppError) Error() string {
	return e.Message
}

type ServerError struct {
	Message string `json:"message"`
	Err     error  `json:"-"`
}

func (e ServerError) Error() string {
	return e.Err.Error()
}
