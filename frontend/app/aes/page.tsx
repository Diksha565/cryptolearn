
"use client";
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Key, Lock, Unlock, Play } from "lucide-react";
import { AESWalkthrough } from "@/components/aes-walkthrough";
import { aesAPI } from "@/lib/api";

// Helper function to check if string is valid base64 and decodes to 16 bytes
function isValidBase64IV(str: string): boolean {
	try {
		if (str.length !== 24) return false; // Base64 for 16 bytes is 24 chars
		const decoded = atob(str);
		return decoded.length === 16;
	} catch {
		return false;
	}
}

// --- AES Helper Functions (for learning, not production) ---
// S-box for SubBytes
const sBox = [
	// ... 256 values ...
	0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
	0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
	0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
	0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
	0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
	0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
	0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
	0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
	0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
	0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
	0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
	0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
	0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
	0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
	0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
	0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

function subBytes(state: number[][]) {
	return state.map(row => row.map(byte => sBox[byte]));
}

function shiftRows(state: number[][]) {
	return state.map((row, i) => row.slice(i).concat(row.slice(0, i)));
}

function addRoundKey(state: number[][], roundKey: number[][]) {
	return state.map((row, i) => row.map((byte, j) => byte ^ roundKey[i][j]));
}

function mixColumns(state: number[][]) {
	// For learning, a simple version
	function xtime(a: number) {
		return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
	}
	const out = Array(4).fill(0).map(() => Array(4).fill(0));
	for (let c = 0; c < 4; c++) {
		out[0][c] = xtime(state[0][c]) ^ xtime(state[1][c]) ^ state[1][c] ^ state[2][c] ^ state[3][c];
		out[1][c] = state[0][c] ^ xtime(state[1][c]) ^ xtime(state[2][c]) ^ state[2][c] ^ state[3][c];
		out[2][c] = state[0][c] ^ state[1][c] ^ xtime(state[2][c]) ^ xtime(state[3][c]) ^ state[3][c];
		out[3][c] = xtime(state[0][c]) ^ state[0][c] ^ state[1][c] ^ state[2][c] ^ xtime(state[3][c]);
	}
	return out;
}

function textToState(text: string) {
	// Pad to 16 bytes
		const bytes = Array.from(text.padEnd(16, '\0')).map(c => c.charCodeAt(0));
		const state: number[][] = [[], [], [], []];
		for (let i = 0; i < 16; i++) {
			(state[i % 4] as number[]).push(bytes[i]);
		}
		return state;
}

function stateToText(state: number[][]) {
	return state.flat().map(b => String.fromCharCode(b)).join('').replace(/\0+$/, '');
}

function cloneState(state: number[][]) {
	return state.map(row => [...row]);
}

function simpleKeyExpansion(key: number[][]) {
	// For learning, just repeat the key for each round
	return Array(11).fill(0).map(() => cloneState(key));
}

// --- AES Step-by-Step ---
function aesEncryptSteps(plaintext: string, keyText: string) {
	const state = textToState(plaintext);
	const key = textToState(keyText);
	const roundKeys = simpleKeyExpansion(key);
	const steps = [];
	let current = cloneState(state);
	steps.push({ label: "Initial State", state: cloneState(current) });
	current = addRoundKey(current, roundKeys[0]);
	steps.push({ label: "AddRoundKey (Round 0)", state: cloneState(current) });
	for (let round = 1; round <= 9; round++) {
		current = subBytes(current);
		steps.push({ label: `SubBytes (Round ${round})`, state: cloneState(current) });
		current = shiftRows(current);
		steps.push({ label: `ShiftRows (Round ${round})`, state: cloneState(current) });
		current = mixColumns(current);
		steps.push({ label: `MixColumns (Round ${round})`, state: cloneState(current) });
		current = addRoundKey(current, roundKeys[round]);
		steps.push({ label: `AddRoundKey (Round ${round})`, state: cloneState(current) });
	}
	// Final round (no MixColumns)
	current = subBytes(current);
	steps.push({ label: "SubBytes (Round 10)", state: cloneState(current) });
	current = shiftRows(current);
	steps.push({ label: "ShiftRows (Round 10)", state: cloneState(current) });
	current = addRoundKey(current, roundKeys[10]);
	steps.push({ label: "AddRoundKey (Round 10)", state: cloneState(current) });
	return steps;
}

function aesDecryptSteps(ciphertext: string, keyText: string) {
	// For learning, just reverse the steps (not a true AES decryption)
	// In real AES, decryption uses InvSubBytes, InvShiftRows, InvMixColumns, etc.
	// Here, we just show the process for learning
	// This is NOT secure!
	return [{ label: "Decryption not implemented for learning demo", state: textToState(ciphertext) }];
}

function stateToHex(state: number[][]) {
	return state.map(row => row.map(b => b.toString(16).padStart(2, '0')).join(' ')).join('\n');
}

// --- React Page ---

export default function AESPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Key input state
	const [key, setKey] = useState("");
	const [keySize, setKeySize] = useState(256);
	const [iv, setIv] = useState("");

	// Text encryption state
	const [plaintext, setPlaintext] = useState("");
	const [ciphertext, setCiphertext] = useState("");
	const [decrypted, setDecrypted] = useState("");

	const clearMessages = () => {
		setError(null);
		setSuccess(null);
	};

	const handleEncrypt = async () => {
		clearMessages();
		if (!plaintext.trim()) {
			setError("Please enter text to encrypt");
			return;
		}
		if (!key.trim()) {
			setError("Please enter a key");
			return;
		}
		if (iv && iv.trim().length > 0 && iv.trim().length !== 16 && !isValidBase64IV(iv.trim())) {
			setError("IV must be exactly 16 characters (bytes) long or valid base64");
			return;
		}
		setLoading(true);
		try {
			const payload: any = {
				plaintext: plaintext.trim(),
				key: key.trim(),
				key_size: keySize,
				mode: "CBC",
			};
			if (iv && (iv.trim().length === 16 || isValidBase64IV(iv.trim()))) {
				payload.iv = iv.trim();
			}
			const result = await aesAPI.encrypt(payload);
			if (result.success) {
				setCiphertext(result.ciphertext);
				// Auto-populate IV if it was generated by backend
				if (result.iv && (!iv || iv.trim().length === 0)) {
					setIv(result.iv);
				}
				setSuccess("Text encrypted successfully!");
			} else {
				setError(result.error || "Encryption failed");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Encryption failed");
		} finally {
			setLoading(false);
		}
	};	const handleDecrypt = async () => {
		clearMessages();
		if (!ciphertext.trim()) {
			setError("Please enter ciphertext to decrypt");
			return;
		}
		if (!key.trim()) {
			setError("Please enter a key");
			return;
		}
		if (iv && iv.trim().length > 0 && iv.trim().length !== 16 && !isValidBase64IV(iv.trim())) {
			setError("IV must be exactly 16 characters (bytes) long or valid base64");
			return;
		}
		setLoading(true);
		try {
			const payload: any = {
				ciphertext: ciphertext.trim(),
				key: key.trim(),
				key_size: keySize,
				mode: "CBC",
			};
			if (iv && (iv.trim().length === 16 || isValidBase64IV(iv.trim()))) {
				payload.iv = iv.trim();
			}
			const result = await aesAPI.decrypt(payload);
			if (result.success) {
				setDecrypted(result.plaintext);
				setSuccess("Text decrypted successfully!");
			} else {
				setError(result.error || "Decryption failed");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Decryption failed");
		} finally {
			setLoading(false);
		}
	};	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">AES Encryption</h1>
					<p className="text-lg text-muted-foreground mb-6">
						AES (Advanced Encryption Standard) is a symmetric-key algorithm for secure data encryption. It operates on 128-bit blocks and supports key sizes of 128, 192, or 256 bits.
					</p>
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Key className="h-5 w-5" />
									How AES Works
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<p className="text-sm text-muted-foreground">
									AES uses a series of rounds to transform plaintext into ciphertext using substitution, permutation, and mixing operations.
								</p>
								<div className="space-y-1 text-xs">
									<p><strong>Key Expansion:</strong> Generate round keys from the cipher key</p>
									<p><strong>Encryption:</strong> Multiple rounds of SubBytes, ShiftRows, MixColumns, AddRoundKey</p>
									<p><strong>Decryption:</strong> Reverse the encryption steps</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="h-5 w-5" />
									Applications
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li>• Secure web communications (HTTPS/TLS)</li>
									<li>• Disk and file encryption</li>
									<li>• VPN and secure messaging</li>
									<li>• Mobile device encryption</li>
									<li>• Cloud storage security</li>
								</ul>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Unlock className="h-5 w-5" />
									Security & Limitations
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li>• 128, 192, or 256-bit keys</li>
									<li>• Fast and efficient for large data</li>
									<li>• Requires secure key management</li>
									<li>• Vulnerable to weak key/IV choices</li>
									<li>• Side-channel attack considerations</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>

				{error && (
					<Card className="mb-6 border-red-200 bg-red-50">
						<CardContent className="text-red-700">{error}</CardContent>
					</Card>
				)}
				{success && (
					<Card className="mb-6 border-green-200 bg-green-50">
						<CardContent className="text-green-700">{success}</CardContent>
					</Card>
				)}

				<Tabs defaultValue="encrypt" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="encrypt" className="flex items-center gap-2">
							<Lock className="h-4 w-4" />
							Text Encryption
						</TabsTrigger>
						<TabsTrigger value="decrypt" className="flex items-center gap-2">
							<Unlock className="h-4 w-4" />
							Text Decryption
						</TabsTrigger>
						<TabsTrigger value="walkthrough" className="flex items-center gap-2">
							<Play className="h-4 w-4" />
							AES Walkthrough
						</TabsTrigger>
					</TabsList>

					<TabsContent value="encrypt">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="h-5 w-5" />
									Text Encryption
								</CardTitle>
								<CardDescription>
									Encrypt text messages using AES (CBC mode)
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Plaintext</Label>
									<Textarea
										placeholder="Enter text to encrypt..."
										value={plaintext}
										onChange={(e) => setPlaintext(e.target.value)}
										rows={4}
									/>
								</div>
								<div className="space-y-2">
									<Label>Key</Label>
									<Input
										placeholder="Enter key (16/24/32 chars for 128/192/256 bits)"
										value={key}
										onChange={(e) => setKey(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>IV (Optional)</Label>
									<Input
										placeholder="Enter IV (16 chars) or leave empty for auto-generation"
										value={iv}
										onChange={(e) => setIv(e.target.value)}
									/>
								</div>
								<Button
									onClick={handleEncrypt}
									disabled={loading}
									className="w-full"
								>
									{loading ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<Lock className="h-4 w-4 mr-2" />
									)}
									Encrypt
								</Button>
								{ciphertext && (
									<div className="space-y-3 p-4 bg-muted rounded-lg">
										<div className="space-y-2">
											<Label>Ciphertext (Base64)</Label>
											<Textarea
												value={ciphertext}
												readOnly
												rows={4}
												className="font-mono text-xs"
											/>
										</div>
										{iv && (
											<div className="space-y-2">
												<Label>IV Used (copy this for decryption)</Label>
												<Input
													value={iv}
													readOnly
													className="font-mono text-xs bg-yellow-50"
												/>
											</div>
										)}
										<div className="text-sm text-muted-foreground">
											<strong>Note:</strong> Use the same IV for decryption that was used for encryption.
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="decrypt">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Unlock className="h-5 w-5" />
									Text Decryption
								</CardTitle>
								<CardDescription>
									Decrypt ciphertext using AES key
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Ciphertext (Base64)</Label>
									<Textarea
										placeholder="Enter base64 ciphertext..."
										value={ciphertext}
										onChange={(e) => setCiphertext(e.target.value)}
										rows={4}
										className="font-mono text-xs"
									/>
								</div>
								<div className="space-y-2">
									<Label>Key</Label>
									<Input
										placeholder="Enter key (16/24/32 chars for 128/192/256 bits)"
										value={key}
										onChange={(e) => setKey(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>IV (Required for decryption)</Label>
									<Input
										placeholder="Enter the IV used during encryption (16 chars or base64)"
										value={iv}
										onChange={(e) => setIv(e.target.value)}
									/>
								</div>
								<Button
									onClick={handleDecrypt}
									disabled={loading}
									className="w-full"
								>
									{loading ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<Unlock className="h-4 w-4 mr-2" />
									)}
									Decrypt
								</Button>
								{decrypted && (
									<div className="space-y-3 p-4 bg-muted rounded-lg">
										<div className="space-y-2">
											<Label>Decrypted Text</Label>
											<Textarea
												value={decrypted}
												readOnly
												rows={4}
												className="bg-green-50 text-black border-green-200"
											/>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="walkthrough">
						<AESWalkthrough />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

