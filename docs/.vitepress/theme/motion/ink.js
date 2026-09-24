import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

/**
 * 水墨动效的四种笔法。
 * 通用缓动（power3.out）是"淡入上浮"，和水墨无关，这里换成毛笔的动作。
 */
export const INK_EASE = {
  // 行笔：起笔一顿（前段近乎静止），中段推进，收笔回锋越界约 3%。
  stroke: CustomEase.create('inkStroke', 'M0,0 C0.04,0.04 0.08,0.78 0.24,0.92 0.42,1.03 0.66,1.01 1,1'),
  // 晕染：墨在纸纤维里散开，慢起慢收。
  bloom: 'power1.inOut',
  // 呼吸：雾气与水纹的循环，正弦，没有机械感。
  breathe: 'sine.inOut',
  // 点厾：笔尖点下后纸张回弹。
  dot: 'back.out(1.5)',
  // 压印：印章落下。
  press: 'power2.out',
  // 收锋：墨迹开始时有重量，尾端轻轻回锋。
  settle: CustomEase.create('inkSettle', 'M0,0 C0.16,0.72 0.22,0.98 0.52,1 0.72,1.01 0.82,0.98 1,1')
}
