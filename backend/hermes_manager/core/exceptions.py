"""自定义异常"""


class HermesManagerError(Exception):
    """基础异常"""
    status_code: int = 500
    detail: str = "Internal server error"


class NotFoundError(HermesManagerError):
    status_code = 404

    def __init__(self, resource: str, identifier: str):
        self.detail = f"{resource} not found: {identifier}"


class ConflictError(HermesManagerError):
    status_code = 409

    def __init__(self, detail: str):
        self.detail = detail


class ValidationError(HermesManagerError):
    status_code = 400

    def __init__(self, detail: str):
        self.detail = detail


class CLIError(HermesManagerError):
    status_code = 500

    def __init__(self, command: str, detail: str):
        self.detail = f"CLI command '{command}' failed: {detail}"
