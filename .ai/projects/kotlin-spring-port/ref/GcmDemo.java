import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.HexFormat;

public class GcmDemo {
    static final SecretKeySpec KEY = new SecretKeySpec(new byte[32], "AES"); // 데모용: 0으로 채운 32바이트
    static final HexFormat HEX = HexFormat.of();
    static final SecureRandom RND = new SecureRandom();

    static byte[] enc(byte[] iv, String plain) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, KEY, new GCMParameterSpec(128, iv));
        return c.doFinal(plain.getBytes());
    }

    static String dec(byte[] iv, byte[] blob) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.DECRYPT_MODE, KEY, new GCMParameterSpec(128, iv));
        return new String(c.doFinal(blob));
    }

    static byte[] iv() { byte[] v = new byte[12]; RND.nextBytes(v); return v; }

    static void show(String label, byte[] iv, byte[] blob) {
        int n = blob.length - 16;
        System.out.printf("%s%n  IV   = %s%n  암호문 = %s (%d바이트)%n  태그  = %s%n",
            label, HEX.formatHex(iv),
            HEX.formatHex(java.util.Arrays.copyOfRange(blob, 0, n)), n,
            HEX.formatHex(java.util.Arrays.copyOfRange(blob, n, blob.length)));
    }

    public static void main(String[] a) throws Exception {
        String plain = "{\"userId\":\"hjj\"}";
        System.out.println("평문 = " + plain + "  (" + plain.getBytes().length + "바이트)\n");

        System.out.println("─── ① 같은 평문·같은 키를 두 번 암호화 ───");
        byte[] iv1 = iv(), iv2 = iv();
        show("1회차", iv1, enc(iv1, plain));
        show("2회차", iv2, enc(iv2, plain));

        System.out.println("\n─── ② 암호문 1바이트 변조 ───");
        byte[] blob = enc(iv1, plain);
        blob[0] ^= 0x01;
        try { dec(iv1, blob); System.out.println("  통과됨 (있으면 안 되는 일)"); }
        catch (Exception e) { System.out.println("  " + e.getClass().getSimpleName() + " ← 잡아냈다"); }

        System.out.println("\n─── ③ IV 1바이트만 변조 (IV는 평문으로 붙어있는데?) ───");
        byte[] blob2 = enc(iv1, plain);
        byte[] badIv = iv1.clone();
        badIv[0] ^= 0x01;
        try { dec(badIv, blob2); System.out.println("  통과됨"); }
        catch (Exception e) { System.out.println("  " + e.getClass().getSimpleName() + " ← IV도 인증 범위 안에 있다"); }

        System.out.println("\n─── ④ IV를 재사용하면? (금지된 이유) ───");
        byte[] reused = iv();
        byte[] c1 = enc(reused, "AAAAAAAAAAAAAAAA");
        byte[] c2 = enc(reused, "AAAAAAAAAAAAAAAB");
        byte[] x = new byte[16];
        for (int i = 0; i < 16; i++) x[i] = (byte) (c1[i] ^ c2[i]);
        System.out.println("  암호문1 XOR 암호문2 = " + HEX.formatHex(x));
        System.out.println("  평문1  XOR 평문2   = " + HEX.formatHex(
            new byte[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(byte)('A'^'B')}));
        System.out.println("  → 완전히 일치. 암호문 차이가 평문 차이를 그대로 노출한다");
    }
}
