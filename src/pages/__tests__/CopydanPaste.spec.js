import { describe, it, assert, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import CopydanPaste from '../CopydanPaste.vue'

describe('Copy dan Paste', () => {
  assert.exists(CopydanPaste)

  const wrapper = mount(CopydanPaste, {
    props: { } 
  })

  // textarea: copydanpaste dan hasil
  const copydanpaste = wrapper.find('[data-test="copydanpaste"]')
  const hasil = wrapper.find('[data-test="hasil"]')

  // button: btnReset dan btnCopy
  const btnReset = wrapper.find('[data-test="btnReset"]') 
  const btnCopy = wrapper.find('[data-test="btnCopy"]')

  // button: btnTweet
  const btnTweet = wrapper.find('[data-test="btnTweet"]')

  it('init', () => {
    assert.isEmpty(copydanpaste.element.value)
    // TODO: copydanpaste.element.focus() => undefined. Why?
    assert.equal(copydanpaste.element.focus(), undefined)

    assert.isEmpty(hasil.element.value)

    assert.isUndefined(btnReset.attributes().disabled)
    assert.equal(btnCopy.attributes().disabled, '')
  })  

  it('lingkaran dari `for`', async() => {
    // test cases
    const testCases = [
      { 
        copydanpaste:`
...
>>> Indonesia

Sedang tren dalam topik Indonesia
(Indonesia) Menpan RB
Olahraga · Populer
(Indonesia) #TimnasIndonesia
2.233 rb Tweet
Sedang tren dalam topik Indonesia
(Indonesia) Yayasan Aksi Cepat Tanggap
1.660 Tweet

>>> Inggris
Trending in Indonesia
(Inggris) Menpan RB
Trending in Indonesia
(Inggris) #TimnasIndonesia
10.9K Tweets
Entertainment · Trending
(Inggris) Yayasan Aksi Cepat Tanggap
54.5 Tweets
`, 
        hasil: 'Tags: (Indonesia) Menpan RB, (Indonesia) #TimnasIndonesia, (Indonesia) Yayasan Aksi Cepat Tanggap, (Inggris) Menpan RB, (Inggris) #TimnasIndonesia, (Inggris) Yayasan Aksi Cepat Tanggap',
        tweetIs: 'Tweet is: + 96',
        bntCopyDanTweet: true
      },
      {
        copydanpaste: '-',
        hasil: 'Tidak ada hasil',
        tweetIs: 'Tweet is: + 280',
        bntCopyDanTweet: false
      },
      {
        copydanpaste: '',
        hasil: '',
        tweetIs: 'Tweet is: + 280',
        bntCopyDanTweet: false
      }
    ]

    for (let test of testCases) {
      copydanpaste.setValue(test.copydanpaste)

      assert.equal(test.copydanpaste, copydanpaste.element.value)

      await copydanpaste.trigger('change')

      assert.equal(
        hasil.element.value,
        test.hasil
      )

      assert.equal(btnTweet.text(), test.tweetIs)

      if (test.bntCopyDanTweet) {
        // button: bntCopy dan bntTweet diaktifkan
        assert.isUndefined(btnCopy.attributes().disabled)
        assert.isUndefined(btnTweet.attributes().disabled)
      } else {
        // button: bntCopy dan bntTweet dinonaktifkan
        assert.equal(btnCopy.attributes().disabled, '')
        assert.equal(btnTweet.attributes().disabled, '')
      }
    }
  })

  it('button reset', async() => {
    // 1. textarea: copydanpaste = '-'
    // 2. textarea: hasil = 'Tidak ada hasil'
    copydanpaste.setValue('-')
    hasil.setValue('Tidak ada hasil')

    assert.equal(copydanpaste.element.value, '-')
    assert.equal(hasil.element.value, 'Tidak ada hasil')

    await btnReset.trigger('click')
    assert.equal(copydanpaste.element.value, '')
    assert.equal(hasil.element.value, '')
  })
})

// TDD
// ✅ ❎
// 1. textarea `hasil` untuk array untuk trends ✅
// 2. textarea `tweet` ini diaktifkan, jika maks. 280 karakter 
// 3. textarea `copy` ini diaktifkan dan textarea `tweet` jika ini dinonaktifkan
describe('Tweet', () => {
  assert.exists(CopydanPaste)

  const wrapper = mount(CopydanPaste, {
    props: { },
    data() {
      return {
        arraytrends: [
          {
            text: "#TimnasIndonesia",
            completed: true
          },
          {
            text: "Test 1",
            completed: true
          },
          {
            text: "#Test2",
            completed: true
          },
          {
            text: "Test 3",
            completed: true
          }
        ],
      }
    } 
  })

  // array dan checkbox untuk trends
  const arrayTrends = wrapper.findAll('[data-test="arrayTrends"]')
  const checkboxTrends = wrapper.findAll('[data-test="trends-checkbox"]')

  // textarea: copydanpaste dan hasil
  const copydanpaste = wrapper.find('[data-test="copydanpaste"]')
  const hasil = wrapper.find('[data-test="hasil"]')

  copydanpaste.setValue(`
...
Olahraga · Populer
#TimnasIndonesia
Sedang tren dalam topik Indonesia
Test 1
2.233 rb Tweet
Sedang tren dalam topik Indonesia
#Test2
1.660 Tweet
Sedang tren dalam topik Indonesia
Test 3
54.5 Tweet
...
  `)

  it('textarea `hasil` untuk array untuk trends: tidak dicentang', async() => {
    await copydanpaste.trigger('change')
        
    assert.equal(hasil.element.value, 'Tags: #TimnasIndonesia, Test 1, #Test2, Test 3')

    // test cases
    const testCases = [
      {
        name: '#TimnasIndonesia',
        index: 0,
        listBool: [false, true, true, true],
        hasil: 'Tags: Test 1, #Test2, Test 3'
      },
      {
        name: 'Test 1',
        index: 1,
        listBool: [false, false, true, true],
        hasil: 'Tags: #Test2, Test 3'
      },
      {
        name: '#Test2',
        index: 2,
        listBool: [false, false, false, true],
        hasil: 'Tags: Test 3'
      },
      {
        name: 'Test 3',
        index: 3,
        listBool: [false, false, false, false],
        hasil: 'Tidak ada hasil'
      }
    ]

    for (let test of testCases) {
      console.debug('unchecked ke-', test.name)
      await checkboxTrends.at(test.index).setValue(false)
      
      for (let i = 0; i < test.listBool.length; i++) {
        if (test.listBool[i]) {
          expect(arrayTrends.at(i).classes()).toContain('completed')
        } else {
          // same: assert.deepEqual(arrayTrends.at(...).classes(), [])
          expect(arrayTrends.at(i).classes()).to.deep.equal([])
        }
      }

      assert.equal(hasil.element.value, test.hasil)
    }
  })

  it('textarea `hasil` untuk array untuk trends: dicentang', async() => {    
    assert.equal(hasil.element.value, 'Tidak ada hasil')

    console.debug('-----')

    // test cases
    const testCases = [   
      {
        name: 'Test 1',
        index: 1,
        listBool: [false, true, false, false],
        hasil: 'Tags: Test 1'
      },
      {
        name: 'Test 3',
        index: 3,
        listBool: [false, true, false, true],
        hasil: 'Tags: Test 1, Test 3'
      },
      {
        name: '#TimnasIndonesia',
        index: 0,
        listBool: [true, true, false, true],
        hasil: 'Tags: #TimnasIndonesia, Test 1, Test 3'
      },
      {
        name: '#Test2',
        index: 2,
        listBool: [true, true, true, true],
        hasil: 'Tags: #TimnasIndonesia, Test 1, #Test2, Test 3'
      }  
    ]

    for (let test of testCases) {
      console.debug('checked ke-', test.name)
      await checkboxTrends.at(test.index).setValue(true)
      
      for (let i = 0; i < test.listBool.length; i++) {
        if (test.listBool[i]) {
          expect(arrayTrends.at(i).classes()).toContain('completed')
        } else {
          // same: assert.deepEqual(arrayTrends.at(...).classes(), [])
          expect(arrayTrends.at(i).classes()).to.deep.equal([])
        }
      }

      assert.equal(hasil.element.value, test.hasil)
    }
  })

  it('textarea `hasil` untuk array untuk trends: ditweet', async() => {    
    hasil.setValue('Tags: Lorem ipsum dolor sit amet, consectetur adipiscing elit, Phasellus risus lectus, venenatis ac scelerisque eu, efficitur id mi, Nunc dolor ligula, viverra et rhoncus in, iaculis at mi, Vivamus erat justo, cursus sit amet felis non, posuere lobortis odio, Vestibulum ante ipsum primis')
    assert.equal(hasil.element.value, 'Tidak ada hasil')

    console.debug('-----')
  })
})