'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, Phone, CheckCircle, Zap, Heart, Smartphone } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone')
  const [showOTPForm, setShowOTPForm] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    countryCode: '+1',
    email: '',
    password: '',
    otp: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [errors, setErrors] = useState<{
    phoneNumber?: string
    email?: string
    password?: string
    otp?: string
    general?: string
  }>({})

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{7,15}$/
    if (!phone) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }))
      return false
    }
    const cleanPhone = phone.replace(/\D/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number (7-15 digits)' }))
      return false
    }
    setErrors(prev => ({ ...prev, phoneNumber: undefined }))
    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }))
      return false
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
      return false
    }
    setErrors(prev => ({ ...prev, email: undefined }))
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }))
      return false
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }))
      return false
    }
    setErrors(prev => ({ ...prev, password: undefined }))
    return true
  }

  const sendOTP = async () => {
    if (!validatePhoneNumber(formData.phoneNumber)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/otp/send-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
          type: 'LOGIN'
        })
      })

      if (response.ok) {
        setOtpSent(true)
        setShowOTPForm(true)
        setErrors(prev => ({ ...prev, general: undefined }))
      } else {
        const data = await response.json()
        setErrors(prev => ({ ...prev, general: data.error || 'Failed to send OTP' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Failed to send OTP. Please try again.' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.otp || formData.otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the 6-digit OTP' }))
      return
    }

    setIsLoading(true)
    try {
      // Verify OTP first
      const verifyResponse = await fetch('/api/otp/verify-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
          code: formData.otp
        })
      })

      if (verifyResponse.ok) {
        // Use NextAuth signIn with credentials
        const result = await signIn('credentials', {
          phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
          method: 'otp',
          otpVerified: 'true',
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
        } else {
          setErrors(prev => ({ ...prev, general: 'OTP login failed. Please try again.' }))
        }
      } else {
        const data = await verifyResponse.json()
        setErrors(prev => ({ ...prev, otp: data.error || 'Invalid OTP' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'OTP verification failed. Please try again.' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    let isValid = false
    if (loginMethod === 'phone') {
      isValid = validatePhoneNumber(formData.phoneNumber) && validatePassword(formData.password)
    } else {
      isValid = validateEmail(formData.email) && validatePassword(formData.password)
    }

    if (isValid) {
      setIsLoading(true)
      setErrors(prev => ({ ...prev, general: undefined }))

      try {
        const result = await signIn('credentials', {
          email: loginMethod === 'email' ? formData.email : undefined,
          phoneNumber: loginMethod === 'phone' ? `${formData.countryCode}${formData.phoneNumber}` : undefined,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
        } else {
          setErrors(prev => ({ ...prev, general: 'Invalid credentials. Please check your details and try again.' }))
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      setErrors(prev => ({ ...prev, general: `${provider} login failed. Please try again.` }))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2 min-h-[700px]">

        {/* Left Side - Form */}
        <div className="p-8 lg:p-12 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Log in</h1>
              <p className="text-gray-600">Access your account as both Guest and Host</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              {/* Phone OTP Button */}
              <button
                onClick={() => {
                  setShowOTPForm(true)
                  setLoginMethod('phone')
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-orange-300 rounded-lg bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="w-5 h-5" />
                📱 Continue with Phone (OTP)
              </button>
            </div>

            {/* OTP Form */}
            {showOTPForm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">📱 Phone Verification</h3>

                {!otpSent ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+1">🇨🇦 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+93">🇦🇫 +93</option>
                        <option value="+355">🇦🇱 +355</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+376">🇦🇩 +376</option>
                        <option value="+244">🇦🇴 +244</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+374">🇦🇲 +374</option>
                        <option value="+297">🇦🇼 +297</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+43">🇦🇹 +43</option>
                        <option value="+994">🇦🇿 +994</option>
                        <option value="+1">🇧🇸 +1</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+1">🇧🇧 +1</option>
                        <option value="+375">🇧🇾 +375</option>
                        <option value="+32">🇧🇪 +32</option>
                        <option value="+501">🇧🇿 +501</option>
                        <option value="+229">🇧🇯 +229</option>
                        <option value="+1">🇧🇲 +1</option>
                        <option value="+975">🇧🇹 +975</option>
                        <option value="+591">🇧🇴 +591</option>
                        <option value="+387">🇧🇦 +387</option>
                        <option value="+267">🇧🇼 +267</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+673">🇧🇳 +673</option>
                        <option value="+359">🇧🇬 +359</option>
                        <option value="+226">🇧🇫 +226</option>
                        <option value="+257">🇧🇮 +257</option>
                        <option value="+855">🇰🇭 +855</option>
                        <option value="+237">🇨🇲 +237</option>
                        <option value="+238">🇨🇻 +238</option>
                        <option value="+235">🇹🇩 +235</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+269">🇰🇲 +269</option>
                        <option value="+506">🇨🇷 +506</option>
                        <option value="+385">🇭🇷 +385</option>
                        <option value="+53">🇨🇺 +53</option>
                        <option value="+357">🇨🇾 +357</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+243">🇨🇩 +243</option>
                        <option value="+45">🇩🇰 +45</option>
                        <option value="+253">🇩🇯 +253</option>
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+503">🇸🇻 +503</option>
                        <option value="+240">🇬🇶 +240</option>
                        <option value="+291">🇪🇷 +291</option>
                        <option value="+372">🇪🇪 +372</option>
                        <option value="+268">🇸🇿 +268</option>
                        <option value="+251">🇪🇹 +251</option>
                        <option value="+679">🇫🇯 +679</option>
                        <option value="+358">🇫🇮 +358</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+241">🇬🇦 +241</option>
                        <option value="+220">🇬🇲 +220</option>
                        <option value="+995">🇬🇪 +995</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+30">🇬🇷 +30</option>
                        <option value="+502">🇬🇹 +502</option>
                        <option value="+224">🇬🇳 +224</option>
                        <option value="+245">🇬🇼 +245</option>
                        <option value="+592">🇬🇾 +592</option>
                        <option value="+509">🇭🇹 +509</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+852">🇭🇰 +852</option>
                        <option value="+36">🇭🇺 +36</option>
                        <option value="+354">🇮🇸 +354</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+98">🇮🇷 +98</option>
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+972">🇮🇱 +972</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+225">🇨🇮 +225</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+7">🇰🇿 +7</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+686">🇰🇮 +686</option>
                        <option value="+383">🇽🇰 +383</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+996">🇰🇬 +996</option>
                        <option value="+856">🇱🇦 +856</option>
                        <option value="+371">🇱🇻 +371</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+266">🇱🇸 +266</option>
                        <option value="+231">🇱🇷 +231</option>
                        <option value="+218">🇱🇾 +218</option>
                        <option value="+423">🇱🇮 +423</option>
                        <option value="+370">🇱🇹 +370</option>
                        <option value="+352">🇱🇺 +352</option>
                        <option value="+853">🇲🇴 +853</option>
                        <option value="+389">🇲🇰 +389</option>
                        <option value="+261">🇲🇬 +261</option>
                        <option value="+265">🇲🇼 +265</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+960">🇲🇻 +960</option>
                        <option value="+223">🇲🇱 +223</option>
                        <option value="+356">🇲🇹 +356</option>
                        <option value="+222">🇲🇷 +222</option>
                        <option value="+230">🇲🇺 +230</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+691">🇫🇲 +691</option>
                        <option value="+373">🇲🇩 +373</option>
                        <option value="+377">🇲🇨 +377</option>
                        <option value="+976">🇲🇳 +976</option>
                        <option value="+382">🇲🇪 +382</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+258">🇲🇿 +258</option>
                        <option value="+95">🇲🇲 +95</option>
                        <option value="+264">🇳🇦 +264</option>
                        <option value="+674">🇳🇷 +674</option>
                        <option value="+977">🇳🇵 +977</option>
                        <option value="+31">🇳🇱 +31</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+505">🇳🇮 +505</option>
                        <option value="+227">🇳🇪 +227</option>
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+850">🇰🇵 +850</option>
                        <option value="+47">🇳🇴 +47</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+680">🇵🇼 +680</option>
                        <option value="+970">🇵🇸 +970</option>
                        <option value="+507">🇵🇦 +507</option>
                        <option value="+675">🇵🇬 +675</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+242">🇨🇬 +242</option>
                        <option value="+40">🇷🇴 +40</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+250">🇷🇼 +250</option>
                        <option value="+685">🇼🇸 +685</option>
                        <option value="+378">🇸🇲 +378</option>
                        <option value="+239">🇸🇹 +239</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+221">🇸🇳 +221</option>
                        <option value="+381">🇷🇸 +381</option>
                        <option value="+248">🇸🇨 +248</option>
                        <option value="+232">🇸🇱 +232</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+421">🇸🇰 +421</option>
                        <option value="+386">🇸🇮 +386</option>
                        <option value="+677">🇸🇧 +677</option>
                        <option value="+252">🇸🇴 +252</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+211">🇸🇸 +211</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+94">🇱🇰 +94</option>
                        <option value="+249">🇸🇩 +249</option>
                        <option value="+597">🇸🇷 +597</option>
                        <option value="+46">🇸🇪 +46</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+963">🇸🇾 +963</option>
                        <option value="+886">🇹🇼 +886</option>
                        <option value="+992">🇹🇯 +992</option>
                        <option value="+255">🇹🇿 +255</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+670">🇹🇱 +670</option>
                        <option value="+228">🇹🇬 +228</option>
                        <option value="+676">🇹🇴 +676</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+993">🇹🇲 +993</option>
                        <option value="+688">🇹🇻 +688</option>
                        <option value="+256">🇺🇬 +256</option>
                        <option value="+380">🇺🇦 +380</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+998">🇺🇿 +998</option>
                        <option value="+678">🇻🇺 +678</option>
                        <option value="+39">🇻🇦 +39</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+84">🇻🇳 +84</option>
                        <option value="+967">🇾🇪 +967</option>
                        <option value="+260">🇿🇲 +260</option>
                        <option value="+263">🇿🇼 +263</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter phone number"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                    <button
                      onClick={sendOTP}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOTPLogin} className="space-y-3">
                    <p className="text-sm text-blue-700">
                      OTP sent to {formData.countryCode}{formData.phoneNumber}
                    </p>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.otp && (
                      <p className="text-sm text-red-600">{errors.otp}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setFormData(prev => ({ ...prev, otp: '' })) }}
                        className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                      >
                        Resend
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with {loginMethod}</span>
              </div>
            </div>

            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginMethod === 'phone'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                📱 Phone
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                ✉️ Email
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-5">

              {/* Phone/Email Input */}
              {loginMethod === 'phone' ? (
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="w-24 px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+1">🇨🇦 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+93">🇦🇫 +93</option>
                      <option value="+355">🇦🇱 +355</option>
                      <option value="+213">🇩🇿 +213</option>
                      <option value="+376">🇦🇩 +376</option>
                      <option value="+244">🇦🇴 +244</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+374">🇦🇲 +374</option>
                      <option value="+297">🇦🇼 +297</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+43">🇦🇹 +43</option>
                      <option value="+994">🇦🇿 +994</option>
                      <option value="+1">🇧🇸 +1</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+1">🇧🇧 +1</option>
                      <option value="+375">🇧🇾 +375</option>
                      <option value="+32">🇧🇪 +32</option>
                      <option value="+501">🇧🇿 +501</option>
                      <option value="+229">🇧🇯 +229</option>
                      <option value="+1">🇧🇲 +1</option>
                      <option value="+975">🇧🇹 +975</option>
                      <option value="+591">🇧🇴 +591</option>
                      <option value="+387">🇧🇦 +387</option>
                      <option value="+267">🇧🇼 +267</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+673">🇧🇳 +673</option>
                      <option value="+359">🇧🇬 +359</option>
                      <option value="+226">🇧🇫 +226</option>
                      <option value="+257">🇧🇮 +257</option>
                      <option value="+855">🇰🇭 +855</option>
                      <option value="+237">🇨🇲 +237</option>
                      <option value="+238">🇨🇻 +238</option>
                      <option value="+235">🇹🇩 +235</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+269">🇰🇲 +269</option>
                      <option value="+506">🇨🇷 +506</option>
                      <option value="+385">🇭🇷 +385</option>
                      <option value="+53">🇨🇺 +53</option>
                      <option value="+357">🇨🇾 +357</option>
                      <option value="+420">🇨🇿 +420</option>
                      <option value="+243">🇨🇩 +243</option>
                      <option value="+45">🇩🇰 +45</option>
                      <option value="+253">🇩🇯 +253</option>
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+503">🇸🇻 +503</option>
                      <option value="+240">🇬🇶 +240</option>
                      <option value="+291">🇪🇷 +291</option>
                      <option value="+372">🇪🇪 +372</option>
                      <option value="+268">🇸🇿 +268</option>
                      <option value="+251">🇪🇹 +251</option>
                      <option value="+679">🇫🇯 +679</option>
                      <option value="+358">🇫🇮 +358</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+241">🇬🇦 +241</option>
                      <option value="+220">🇬🇲 +220</option>
                      <option value="+995">🇬🇪 +995</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+233">🇬🇭 +233</option>
                      <option value="+30">🇬🇷 +30</option>
                      <option value="+502">🇬🇹 +502</option>
                      <option value="+224">🇬🇳 +224</option>
                      <option value="+245">🇬🇼 +245</option>
                      <option value="+592">🇬🇾 +592</option>
                      <option value="+509">🇭🇹 +509</option>
                      <option value="+504">🇭🇳 +504</option>
                      <option value="+852">🇭🇰 +852</option>
                      <option value="+36">🇭🇺 +36</option>
                      <option value="+354">🇮🇸 +354</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+62">🇮🇩 +62</option>
                      <option value="+98">🇮🇷 +98</option>
                      <option value="+964">🇮🇶 +964</option>
                      <option value="+353">🇮🇪 +353</option>
                      <option value="+972">🇮🇱 +972</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+225">🇨🇮 +225</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+962">🇯🇴 +962</option>
                      <option value="+7">🇰🇿 +7</option>
                      <option value="+254">🇰🇪 +254</option>
                      <option value="+686">🇰🇮 +686</option>
                      <option value="+383">🇽🇰 +383</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+996">🇰🇬 +996</option>
                      <option value="+856">🇱🇦 +856</option>
                      <option value="+371">🇱🇻 +371</option>
                      <option value="+961">🇱🇧 +961</option>
                      <option value="+266">🇱🇸 +266</option>
                      <option value="+231">🇱🇷 +231</option>
                      <option value="+218">🇱🇾 +218</option>
                      <option value="+423">🇱🇮 +423</option>
                      <option value="+370">🇱🇹 +370</option>
                      <option value="+352">🇱🇺 +352</option>
                      <option value="+853">🇲🇴 +853</option>
                      <option value="+389">🇲🇰 +389</option>
                      <option value="+261">🇲🇬 +261</option>
                      <option value="+265">🇲🇼 +265</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+960">🇲🇻 +960</option>
                      <option value="+223">🇲🇱 +223</option>
                      <option value="+356">🇲🇹 +356</option>
                      <option value="+222">🇲🇷 +222</option>
                      <option value="+230">🇲🇺 +230</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+691">🇫🇲 +691</option>
                      <option value="+373">🇲🇩 +373</option>
                      <option value="+377">🇲🇨 +377</option>
                      <option value="+976">🇲🇳 +976</option>
                      <option value="+382">🇲🇪 +382</option>
                      <option value="+212">🇲🇦 +212</option>
                      <option value="+258">🇲🇿 +258</option>
                      <option value="+95">🇲🇲 +95</option>
                      <option value="+264">🇳🇦 +264</option>
                      <option value="+674">🇳🇷 +674</option>
                      <option value="+977">🇳🇵 +977</option>
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+64">🇳🇿 +64</option>
                      <option value="+505">🇳🇮 +505</option>
                      <option value="+227">🇳🇪 +227</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+850">🇰🇵 +850</option>
                      <option value="+47">🇳🇴 +47</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+680">🇵🇼 +680</option>
                      <option value="+970">🇵🇸 +970</option>
                      <option value="+507">🇵🇦 +507</option>
                      <option value="+675">🇵🇬 +675</option>
                      <option value="+595">🇵🇾 +595</option>
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+63">🇵🇭 +63</option>
                      <option value="+48">🇵🇱 +48</option>
                      <option value="+351">🇵🇹 +351</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+242">🇨🇬 +242</option>
                      <option value="+40">🇷🇴 +40</option>
                      <option value="+7">🇷🇺 +7</option>
                      <option value="+250">🇷🇼 +250</option>
                      <option value="+685">🇼🇸 +685</option>
                      <option value="+378">🇸🇲 +378</option>
                      <option value="+239">🇸🇹 +239</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+221">🇸🇳 +221</option>
                      <option value="+381">🇷🇸 +381</option>
                      <option value="+248">🇸🇨 +248</option>
                      <option value="+232">🇸🇱 +232</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+421">🇸🇰 +421</option>
                      <option value="+386">🇸🇮 +386</option>
                      <option value="+677">🇸🇧 +677</option>
                      <option value="+252">🇸🇴 +252</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+211">🇸🇸 +211</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+94">🇱🇰 +94</option>
                      <option value="+249">🇸🇩 +249</option>
                      <option value="+597">🇸🇷 +597</option>
                      <option value="+46">🇸🇪 +46</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+963">🇸🇾 +963</option>
                      <option value="+886">🇹🇼 +886</option>
                      <option value="+992">🇹🇯 +992</option>
                      <option value="+255">🇹🇿 +255</option>
                      <option value="+66">🇹🇭 +66</option>
                      <option value="+670">🇹🇱 +670</option>
                      <option value="+228">🇹🇬 +228</option>
                      <option value="+676">🇹🇴 +676</option>
                      <option value="+216">🇹🇳 +216</option>
                      <option value="+90">🇹🇷 +90</option>
                      <option value="+993">🇹🇲 +993</option>
                      <option value="+688">🇹🇻 +688</option>
                      <option value="+256">🇺🇬 +256</option>
                      <option value="+380">🇺🇦 +380</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+598">🇺🇾 +598</option>
                      <option value="+998">🇺🇿 +998</option>
                      <option value="+678">🇻🇺 +678</option>
                      <option value="+39">🇻🇦 +39</option>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+84">🇻🇳 +84</option>
                      <option value="+967">🇾🇪 +967</option>
                      <option value="+260">🇿🇲 +260</option>
                      <option value="+263">🇿🇼 +263</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        onBlur={() => validatePhoneNumber(formData.phoneNumber)}
                        placeholder="Enter phone number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      onBlur={() => validateEmail(formData.email)}
                      placeholder="john.doe@example.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              )}

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    onBlur={() => validatePassword(formData.password)}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Log in to your account'
                )}
              </button>
            </form>

            {/* Info Message */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                🎉 One account for everything! Switch between Guest and Host modes anytime from your dashboard.
              </p>
            </div>

            {/* Signup Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-orange-600 hover:text-orange-500 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>

          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex bg-gradient-to-br from-orange-600 to-orange-700 p-12 items-center justify-center relative overflow-hidden">

          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>
          </div>

          <div className="relative z-10 text-white max-w-md">

            {/* Brand Section */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
              <p className="text-xl text-orange-100">Your Houseiana journey continues</p>
            </div>

            {/* Features List */}
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Dual Mode Access</h3>
                  <p className="text-orange-100 text-sm">Switch between Guest and Host anytime</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Instant Verification</h3>
                  <p className="text-orange-100 text-sm">Phone OTP for secure quick access</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Personalized Experience</h3>
                  <p className="text-orange-100 text-sm">Your preferences saved across all devices</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 p-6 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-center">
                <h4 className="text-3xl font-bold">2M+</h4>
                <p className="text-orange-100 text-sm">Active Users</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-bold">99.9%</h4>
                <p className="text-orange-100 text-sm">Uptime</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-bold">24/7</h4>
                <p className="text-orange-100 text-sm">Support</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}