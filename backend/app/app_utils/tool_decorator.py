import functools
from collections.abc import Callable
from typing import Any


def tool(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to mark a function as a renter-shield agent tool."""

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)

    return wrapper
