package com.senai.plugins.security

import kotlinx.serialization.Serializable

@Serializable
data class MySession(val count: Int = 0)